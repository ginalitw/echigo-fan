// 從 FRF 文章資料庫同步到 src/content/frf + public/images/frf-posts
// 只讀 Notion。發布狀態 = 公開 才上站。沒填 slug 的略過。
//
//   npm run sync:frf
//   npm run sync:frf -- --prune-all
//   npm run sync:frf -- --all     連草稿也抓（測試用）

import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('⚠️  找不到 sharp，圖片將不壓縮。'); }

let heicConvert = null;
try { heicConvert = (await import('heic-convert')).default; } catch { /* 沒裝就算了 */ }

function isHeic(buf) {
  return buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp' &&
    ['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'mif1', 'msf1']
      .includes(buf.toString('ascii', 8, 12));
}

const ARGS = process.argv.slice(2);
const SYNC_ALL = ARGS.includes('--all');
const PRUNE_ALL = ARGS.includes('--prune-all');

const NOTION_TOKEN = process.env.NOTION_FRF_TOKEN || process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_FRF_DATABASE_ID || '2f414f28e4568001b22ad297299115e8';
const DATA_SOURCE_ID = process.env.NOTION_FRF_DATA_SOURCE_ID || '2f414f28-e456-80cb-b742-000b2aeb130f';

if (!NOTION_TOKEN) {
  console.error('❌ 找不到 NOTION_TOKEN。請確認 GitHub Actions secret 已設定。');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });
const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src/content/frf');
const IMAGES_DIR = path.join(ROOT, 'public/images/frf-posts');
const MANIFEST = path.join(ROOT, '.sync-frf-manifest.json');

const yaml = (v) => JSON.stringify(v);
const yamlList = (arr) => `[${arr.map(yaml).join(', ')}]`;

function prop(props, name) { return props?.[name] ?? null; }
function readTitle(props, name) {
  const p = prop(props, name);
  if (!p) return '';
  const arr = p.title || p.rich_text || [];
  return arr.map((t) => t.plain_text).join('').trim();
}
function readText(props, name) {
  const p = prop(props, name);
  if (!p) return '';
  const arr = p.rich_text || p.title || [];
  if (Array.isArray(arr)) return arr.map((t) => t.plain_text).join('').trim();
  if (typeof p.url === 'string') return p.url.trim();
  return '';
}
function readSelect(props, name) {
  const p = prop(props, name);
  return p?.select?.name || p?.status?.name || '';
}
function readMulti(props, name) {
  const p = prop(props, name);
  return (p?.multi_select || []).map((o) => o.name);
}
function readFiles(props, name) {
  const arr = prop(props, name)?.files || [];
  return arr
    .map((f) => (f.type === 'external' ? f.external?.url : f.file?.url))
    .filter(Boolean);
}
function safeSlug(s) {
  return String(s).trim().toLowerCase().replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function pageIdKey(id) {
  return String(id || '').replace(/-/g, '').toLowerCase();
}
function coverUrl(page) {
  const c = page.cover;
  if (!c) return '';
  return c.type === 'external' ? c.external?.url : c.file?.url || '';
}

function extFromUrl(url, contentType) {
  try {
    const m = new URL(url).pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (m) {
      const e = '.' + m[1].toLowerCase();
      return e === '.jpeg' ? '.jpg' : e;
    }
  } catch { /* 忽略 */ }
  const map = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
    'image/gif': '.gif', 'image/webp': '.webp', 'image/svg+xml': '.svg',
  };
  return map[(contentType || '').split(';')[0]] || '.jpg';
}

async function downloadImage(url, dir, baseName, maxWidth = 1600) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(dir, { recursive: true });

  if (sharp) {
    let input = raw;
    if (isHeic(raw)) {
      if (!heicConvert) throw new Error('這是 HEIC 檔，但沒有 heic-convert');
      input = Buffer.from(await heicConvert({ buffer: raw, format: 'JPEG', quality: 0.92 }));
    }
    const out = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const filename = `${baseName}.webp`;
    fs.writeFileSync(path.join(dir, filename), out);
    console.log(`      壓縮：${(raw.length / 1024).toFixed(0)}KB → ${(out.length / 1024).toFixed(0)}KB`);
    return filename;
  }

  const ext = extFromUrl(url, res.headers.get('content-type'));
  if (!['.jpg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    throw new Error(`沒有 sharp，無法處理 ${ext}`);
  }
  const filename = baseName + ext;
  fs.writeFileSync(path.join(dir, filename), raw);
  return filename;
}

function richText(arr) {
  if (!arr || arr.length === 0) return '';
  return arr.map((rt) => {
    let text = rt.plain_text ?? '';
    const a = rt.annotations || {};
    if (a.code) text = '`' + text + '`';
    if (a.bold) text = `**${text}**`;
    if (a.italic) text = `*${text}*`;
    if (a.strikethrough) text = `~~${text}~~`;
    const href = rt.href || rt.text?.link?.url;
    if (href) text = `[${text.replace(/\[|\]/g, '')}](${href})`;
    return text;
  }).join('');
}

async function fetchBlocks(blockId) {
  const out = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    for (const b of res.results) {
      if (b.has_children) b.__children = await fetchBlocks(b.id);
      out.push(b);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function blocksToMarkdown(blocks, slug, ctx, depth = 0) {
  const pad = '  '.repeat(depth);
  let md = '';
  let numbering = 0;

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const next = blocks[idx + 1];
    const endsList = () => (depth === 0 && (!next || next.type !== block.type) ? '\n' : '');
    const type = block.type;
    const data = block[type] || {};
    if (type !== 'numbered_list_item') numbering = 0;

    const childMd = async () => {
      if (!block.__children?.length) return '';
      return await blocksToMarkdown(block.__children, slug, ctx, depth + 1);
    };

    switch (type) {
      case 'paragraph': {
        const text = richText(data.rich_text);
        if (text) md += `${pad}${text}\n\n`;
        md += await childMd();
        break;
      }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        const level = '#'.repeat(Number(type.slice(-1)));
        md += `${level} ${richText(data.rich_text)}\n\n`;
        md += await childMd();
        break;
      }
      case 'bulleted_list_item':
        md += `${pad}- ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      case 'numbered_list_item':
        numbering += 1;
        md += `${pad}${numbering}. ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      case 'to_do':
        md += `${pad}- [${data.checked ? 'x' : ' '}] ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      case 'quote':
        md += `${pad}> ${richText(data.rich_text)}\n\n`;
        md += await childMd();
        break;
      case 'callout': {
        const icon = data.icon?.emoji ? `${data.icon.emoji} ` : '';
        md += `${pad}> ${icon}${richText(data.rich_text)}\n\n`;
        md += await childMd();
        break;
      }
      case 'code': {
        const lang = data.language === 'plain text' ? '' : (data.language || '');
        md += '```' + lang + '\n' + (data.rich_text || []).map((t) => t.plain_text).join('') + '\n```\n\n';
        break;
      }
      case 'divider':
        md += `---\n\n`;
        break;
      case 'toggle':
        md += `${pad}**${richText(data.rich_text)}**\n\n`;
        md += await childMd();
        break;
      case 'image': {
        const url = data.type === 'external' ? data.external?.url : data.file?.url;
        const caption = richText(data.caption);
        if (!url) { console.warn('   ⚠️  圖片區塊沒有網址，已略過'); break; }
        ctx.imageIndex += 1;
        const base = `image-${String(ctx.imageIndex).padStart(2, '0')}`;
        const dir = path.join(IMAGES_DIR, slug);
        try {
          const filename = await downloadImage(url, dir, base);
          const publicPath = `/images/frf-posts/${slug}/${filename}`;
          if (!ctx.cover) ctx.cover = publicPath;
          md += caption
            ? `![${caption}](${publicPath})\n\n*${caption}*\n\n`
            : `![${caption}](${publicPath})\n\n`;
          console.log(`   ⬇️  ${filename}`);
        } catch (err) {
          console.error(`   ❌ 圖片失敗（${base}）：${err.message}`);
        }
        break;
      }
      case 'video':
      case 'file':
      case 'pdf': {
        const url = data.type === 'external' ? data.external?.url : data.file?.url;
        if (url) md += `[${type}](${url})\n\n`;
        break;
      }
      case 'bookmark':
      case 'embed':
      case 'link_preview': {
        const url = data.url;
        const caption = richText(data.caption) || url;
        if (url) md += `[${caption}](${url})\n\n`;
        break;
      }
      case 'table': {
        const rows = block.__children || [];
        if (!rows.length) break;
        const cellText = (r) => (r.table_row?.cells || []).map((c) => richText(c).replace(/\|/g, '\\|'));
        const header = cellText(rows[0]);
        md += `| ${header.join(' | ')} |\n`;
        md += `| ${header.map(() => '---').join(' | ')} |\n`;
        for (const r of rows.slice(data.has_column_header ? 1 : 0)) {
          if (r === rows[0] && data.has_column_header) continue;
          md += `| ${cellText(r).join(' | ')} |\n`;
        }
        md += '\n';
        break;
      }
      case 'column_list':
      case 'column':
      case 'synced_block':
        md += await childMd();
        break;
      case 'table_of_contents':
      case 'breadcrumb':
      case 'child_page':
      case 'child_database':
      case 'unsupported':
        break;
      default:
        console.warn(`   ⚠️  略過區塊：${type}`);
    }
  }
  return md;
}

function mapAudience(tags) {
  const out = [];
  for (const t of tags) {
    if (t.includes('新手')) out.push('beginner');
    else if (t.includes('老手')) out.push('returner');
    else if (t.includes('開始之前')) out.push('start');
    else if (t.includes('通用')) out.push('common');
  }
  return [...new Set(out)];
}

function mapStage(s) {
  if (!s) return '';
  if (s.includes('猶豫')) return 'hesitate';
  if (s.includes('準備')) return 'prep';
  if (s.includes('出發')) return 'go';
  return '';
}

function topicName(t) {
  return String(t).replace(/^[^\p{L}\p{N}]+/u, '').trim() || t;
}

function nFromTitle(title) {
  const m = String(title).match(/^#\s*(\d+)/);
  return m ? m[1].padStart(2, '0') : '';
}

function rewriteNotionLinks(md, idToSlug) {
  return md.replace(
    /https?:\/\/(?:www\.|app\.)?notion\.(?:so|com)\/[^\s)"'\]]+/g,
    (url) => {
      const m = url.match(/([0-9a-f]{32})/i);
      if (!m) return url;
      const slug = idToSlug.get(m[1].toLowerCase());
      return slug ? `/fujirock/${slug}/` : url;
    },
  );
}

async function queryAllPages(dataSourceId) {
  const out = [];
  let cursor;
  do {
    const req = { data_source_id: dataSourceId, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    const res = notion.dataSources?.query
      ? await notion.dataSources.query(req)
      : await notion.databases.query({ database_id: dataSourceId, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function main() {
  console.log('🔍 正在查詢 FRF Notion 資料庫...');
  let all;
  try {
    all = await queryAllPages(DATA_SOURCE_ID);
  } catch (err) {
    console.error('❌ 讀不到 FRF 資料庫。把越後飯同一個 Notion 整合加進「文章列表」資料庫（⋯ → 連線）。');
    console.error(err.body || err.message);
    process.exit(1);
  }
  console.log(`✅ 資料庫共 ${all.length} 筆。`);

  const pages = all.filter((p) => SYNC_ALL || readSelect(p.properties, '發布狀態') === '公開');
  console.log(`✅ 要同步 ${pages.length} 篇${SYNC_ALL ? '（含草稿）' : '（發布狀態=公開）'}。`);

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  if (PRUNE_ALL) {
    for (const f of fs.readdirSync(POSTS_DIR)) {
      if (f.endsWith('.md')) fs.unlinkSync(path.join(POSTS_DIR, f));
    }
    console.log('🧹 已清空 src/content/frf');
  }

  const prepared = [];
  for (const page of pages) {
    const props = page.properties;
    const title = readTitle(props, '文章標題') || '未命名';
    const rawSlug = readText(props, 'slug');
    if (!rawSlug) {
      console.warn(`⚠️  《${title}》沒有 slug，已略過。`);
      continue;
    }
    const slug = safeSlug(rawSlug);
    if (!slug) {
      console.warn(`⚠️  《${title}》slug「${rawSlug}」無效，已略過。`);
      continue;
    }
    prepared.push({
      page, props, title, slug,
      n: nFromTitle(title),
      meta: readText(props, 'meta'),
      audience: mapAudience(readMulti(props, '客群標籤')),
      stage: mapStage(readSelect(props, '階段')),
      topics: readMulti(props, '主題標籤').map(topicName),
    });
  }

  prepared.sort((a, b) => String(a.n).localeCompare(String(b.n)) || a.slug.localeCompare(b.slug));
  const idToSlug = new Map();
  for (const item of prepared) idToSlug.set(pageIdKey(item.page.id), item.slug);

  const written = [];
  for (const item of prepared) {
    const { page, props, title, slug } = item;
    console.log(`\n📄 《${title}》 → ${slug}.md`);

    const imgDir = path.join(IMAGES_DIR, slug);
    if (fs.existsSync(imgDir)) {
      for (const f of fs.readdirSync(imgDir)) {
        try { fs.rmSync(path.join(imgDir, f), { force: true }); } catch { /* 略過 */ }
      }
    }

    const ctx = { imageIndex: 0, cover: '' };
    const coverSrc = coverUrl(page);
    if (coverSrc) {
      try {
        const filename = await downloadImage(coverSrc, imgDir, 'cover');
        ctx.cover = `/images/frf-posts/${slug}/${filename}`;
        console.log(`   🖼  封面 ${filename}`);
      } catch (err) {
        console.error(`   ❌ 封面失敗：${err.message}`);
      }
    }

    const blocks = await fetchBlocks(page.id);
    let body = (await blocksToMarkdown(blocks, slug, ctx)).trim();
    body = rewriteNotionLinks(body, idToSlug);

    if (!ctx.cover) {
      const extras = readFiles(props, '檔案和媒體');
      if (extras[0]) {
        try {
          const filename = await downloadImage(extras[0], imgDir, 'cover');
          ctx.cover = `/images/frf-posts/${slug}/${filename}`;
          console.log(`   🖼  媒體欄封面 ${filename}`);
        } catch (err) {
          console.error(`   ❌ 媒體欄失敗：${err.message}`);
        }
      }
    }

    const fm = [
      '---',
      `title: ${yaml(title)}`,
      item.n ? `n: ${yaml(item.n)}` : null,
      item.meta ? `meta: ${yaml(item.meta)}` : null,
      `audience: ${yamlList(item.audience)}`,
      item.stage ? `stage: ${yaml(item.stage)}` : null,
      item.topics.length ? `topics: ${yamlList(item.topics)}` : null,
      ctx.cover ? `cover: ${yaml(ctx.cover)}` : null,
      `status: "公開"`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), fm + '\n' + body + '\n', 'utf-8');
    written.push(`${slug}.md`);
    console.log(`   ✅ ${body.length} 字、${ctx.imageIndex} 張圖`);
  }

  if (fs.existsSync(MANIFEST)) {
    try {
      const prev = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8')).files || [];
      for (const f of prev) {
        if (!written.includes(f)) {
          const p = path.join(POSTS_DIR, f);
          if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`🗑️  已移除 ${f}`); }
        }
      }
    } catch { /* 略過 */ }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify({ updatedAt: new Date().toISOString(), files: written }, null, 2));

  const live = new Set(prepared.map((x) => x.slug));
  if (fs.existsSync(IMAGES_DIR)) {
    for (const dir of fs.readdirSync(IMAGES_DIR)) {
      const full = path.join(IMAGES_DIR, dir);
      if (!fs.statSync(full).isDirectory() || live.has(dir)) continue;
      fs.rmSync(full, { recursive: true, force: true });
      console.log(`🗑️  已移除孤兒圖片：${dir}`);
    }
  }

  console.log(`\n🎉 FRF 同步完成，共 ${written.length} 篇。`);
}

main().catch((err) => {
  console.error('❌ FRF 同步失敗：', err.body || err.message);
  process.exit(1);
});
