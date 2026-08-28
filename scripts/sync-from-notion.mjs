// scripts/sync-from-notion.mjs  —— v3
//
// 從 Notion 資料庫抓「狀態 = 已發布」的文章，轉成 Astro 的 Markdown，
// 並把文章內的圖片下載到 public/images/posts/<slug>/。
//
// 用法：
//   npm run sync              正常同步
//   npm run sync -- --debug   額外把 Notion 回傳的原始 JSON 存成 notion-debug.json
//   npm run sync -- --all     連草稿/待填也一起同步（測試用）
//   npm run sync -- --prune-all  同步前先清空 src/content/posts（會先備份）
//   npm run sync -- --replay  用上次 --debug 存下的 notion-debug.json 離線重跑（除錯用）
//
// 只讀 Notion，不會寫回任何東西。

import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// sharp 是選用的：有裝就壓縮圖片，沒裝就原樣存檔並提醒一次。
// 這樣就算哪天 sharp 在某個平台裝不起來，同步也不會整個掛掉。
let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('⚠️  找不到 sharp，圖片將不壓縮。執行 npm install 可啟用壓縮。');
}

// iPhone 拍的照片預設是 HEIC，而 HEIC 用 HEVC 編碼，
// sharp 的預建版通常不含 HEVC 解碼器（授權問題），會解不開。
// heic-convert 是純 JavaScript 的解碼器，拿來當備援。
let heicConvert = null;
try {
  heicConvert = (await import('heic-convert')).default;
} catch { /* 沒裝就算了，下面會有明確警告 */ }

// 用檔頭判斷是不是 HEIC/HEIF（副檔名不可靠）
function isHeic(buf) {
  return buf.length > 12 && buf.toString('ascii', 4, 8) === 'ftyp' &&
    ['heic', 'heix', 'hevc', 'heim', 'heis', 'hevm', 'mif1', 'msf1']
      .includes(buf.toString('ascii', 8, 12));
}

const ARGS = process.argv.slice(2);
const DEBUG = ARGS.includes('--debug');
const SYNC_ALL = ARGS.includes('--all');
const PRUNE_ALL = ARGS.includes('--prune-all');
const REPLAY = ARGS.includes('--replay');   // 離線重放 notion-debug.json，不連 API（除了圖片下載）

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('❌ 找不到 NOTION_TOKEN 或 NOTION_DATABASE_ID，請確認 .env 檔案設定正確。');
  process.exitCode = 1;
  process.exit();
}

const notion = new Client({ auth: NOTION_TOKEN });

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const IMAGES_DIR = path.join(ROOT, 'public/images/posts');
const STAMPS_DIR = path.join(ROOT, 'public/images/stamps');
const MANIFEST = path.join(ROOT, '.sync-manifest.json');

const debugDump = { pages: [], blocks: {} };

// ---------- 小工具 ----------

const yaml = (v) => JSON.stringify(v);           // 讓引號、冒號、反斜線都安全
const yamlList = (arr) => `[${arr.map(yaml).join(', ')}]`;

// Notion 屬性讀取：容忍新舊 SDK 的形狀差異
function prop(props, name) {
  return props?.[name] ?? null;
}
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
// 讀 Notion「檔案與媒體」欄位，回傳可下載的網址清單。
// Notion 內部上傳的檔案給的是有時效的簽章網址，所以一定要當下就抓下來。
function readFiles(props, name) {
  const arr = prop(props, name)?.files || [];
  return arr
    .map((f) => (f.type === 'external' ? f.external?.url : f.file?.url))
    .filter(Boolean);
}

// 讀 Notion 日期欄位。只填日期沒填時間時，視為台灣時間當天 00:00。
function readDate(props, name) {
  const start = prop(props, name)?.date?.start;
  if (!start) return null;
  const iso = start.includes('T') ? start : `${start}T00:00:00+08:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
function readMulti(props, name) {
  const p = prop(props, name);
  return (p?.multi_select || []).map((o) => o.name);
}

function safeSlug(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 從圖片網址（含一長串簽章 query）取出真正的副檔名
function extFromUrl(url, contentType) {
  try {
    const pathname = new URL(url).pathname;
    const m = pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (m) {
      const e = '.' + m[1].toLowerCase();
      return e === '.jpeg' ? '.jpg' : e;
    }
  } catch { /* 忽略 */ }
  const map = {
    'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
    'image/gif': '.gif', 'image/webp': '.webp', 'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[(contentType || '').split(';')[0]] || '.jpg';
}

// 用 fetch 下載（Node 18+ 內建，會自動跟隨轉址，比 https.get 可靠）
async function downloadImage(url, dir, baseName, maxWidth = 1600) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(dir, { recursive: true });

  // 目標：一律輸出 WebP。網站上絕不能出現瀏覽器打不開的格式（HEIC 就是），
  // 那會變成破圖——寧可整張跳過並警告，也不要留一個壞掉的連結。
  if (sharp) {
    let input = raw;

    // HEIC 先用純 JS 解碼器轉成 JPEG，再交給 sharp
    if (isHeic(raw)) {
      if (!heicConvert) {
        throw new Error('這是 HEIC 檔（iPhone 預設格式），但沒有安裝 heic-convert 無法轉換');
      }
      console.log('      偵測到 HEIC，先轉檔⋯⋯');
      input = Buffer.from(await heicConvert({ buffer: raw, format: 'JPEG', quality: 0.92 }));
    }

    const out = await sharp(input)
      .rotate()                                   // 依 EXIF 轉正，否則直式照片會躺著
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const filename = `${baseName}.webp`;
    fs.writeFileSync(path.join(dir, filename), out);
    const saved = Math.round((1 - out.length / raw.length) * 100);
    console.log(`      壓縮：${(raw.length / 1024 / 1024).toFixed(1)}MB → ${(out.length / 1024).toFixed(0)}KB（省 ${saved}%）`);
    return filename;
  }

  // 完全沒有 sharp 的情況：只接受瀏覽器原生支援的格式，其餘拒收
  const ext = extFromUrl(url, res.headers.get('content-type'));
  if (!['.jpg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    throw new Error(`沒有 sharp，無法處理 ${ext} 格式（瀏覽器不支援，會變破圖）`);
  }
  const filename = baseName + ext;
  fs.writeFileSync(path.join(dir, filename), raw);
  return filename;
}

// ---------- rich text → Markdown ----------

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
    if (href) text = `[${text}](${href})`;
    return text;
  }).join('');
}

// ---------- 抓 blocks（含分頁 + 巢狀子區塊）----------

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

// ---------- blocks → Markdown ----------

async function blocksToMarkdown(blocks, slug, ctx, depth = 0) {
  const pad = '  '.repeat(depth);
  let md = '';
  let numbering = 0;

  const LIST_TYPES = ['bulleted_list_item', 'numbered_list_item', 'to_do'];

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
        if (text) {
          if (!ctx.lead) ctx.lead = text.replace(/[*`~\[\]]/g, '');
          md += `${pad}${text}\n\n`;
        }
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
      case 'bulleted_list_item': {
        md += `${pad}- ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      }
      case 'numbered_list_item': {
        numbering += 1;
        md += `${pad}${numbering}. ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      }
      case 'to_do': {
        md += `${pad}- [${data.checked ? 'x' : ' '}] ${richText(data.rich_text)}\n`;
        md += await childMd();
        md += endsList();
        break;
      }
      case 'quote': {
        md += `${pad}> ${richText(data.rich_text)}\n\n`;
        md += await childMd();
        break;
      }
      case 'callout': {
        const icon = data.icon?.emoji ? data.icon.emoji + ' ' : '';
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
      case 'toggle': {
        md += `${pad}**${richText(data.rich_text)}**\n\n`;
        md += await childMd();
        break;
      }
      case 'equation':
        md += `$$\n${data.expression || ''}\n$$\n\n`;
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
          console.log(`   ⬇️  已下載圖片：${filename}`);
          const publicPath = `/images/posts/${slug}/${filename}`;
          if (!ctx.cover) ctx.cover = publicPath;   // 第一張圖當這篇的封面
          md += `![${caption}](${publicPath})\n\n`;
        } catch (err) {
          console.error(`   ❌ 圖片下載失敗（${base}）：${err.message}`);
          md += `<!-- 圖片下載失敗：${base} -->\n\n`;
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
        console.warn(`   ⚠️  尚未支援的區塊類型：${type}，已略過。`);
    }
  }
  return md;
}

// ---------- 主流程 ----------

async function resolveDataSourceId() {
  if (process.env.NOTION_DATA_SOURCE_ID) return process.env.NOTION_DATA_SOURCE_ID;
  const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
  const id = db.data_sources?.[0]?.id;
  if (id) return id;
  // 舊版 API 沒有 data_sources 概念，直接用 database_id 當作 data source
  return DATABASE_ID;
}

async function queryAllPages(dataSourceId) {
  const out = [];
  let cursor;
  do {
    const req = { data_source_id: dataSourceId, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) };
    // 不在 API 端過濾，改在本地過濾，少一個會踩到的 API 形狀
    const res = notion.dataSources?.query
      ? await notion.dataSources.query(req)
      : await notion.databases.query({ database_id: dataSourceId, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

function backupPosts() {
  if (!fs.existsSync(POSTS_DIR)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(ROOT, '.backup', `posts-${stamp}`);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (f.endsWith('.md')) fs.copyFileSync(path.join(POSTS_DIR, f), path.join(dest, f));
  }
  console.log(`🗂️  已備份既有文章到 .backup/posts-${stamp}/`);
}

let replayBlocks = null;

async function main() {
  let all;
  if (REPLAY) {
    const dumpPath = path.join(ROOT, 'notion-debug.json');
    if (!fs.existsSync(dumpPath)) {
      console.error('❌ 找不到 notion-debug.json，請先跑一次：npm run sync -- --debug');
      process.exit(1);
    }
    const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
    all = dump.pages || [];
    replayBlocks = dump.blocks || {};
    console.log(`♻️  離線重放模式：從 notion-debug.json 讀到 ${all.length} 筆。`);
  } else {
    console.log('🔍 正在查詢 Notion 資料庫...');
    const dataSourceId = await resolveDataSourceId();
    console.log(`✅ 已定位資料來源：${dataSourceId}`);
    all = await queryAllPages(dataSourceId);
    console.log(`✅ 資料庫共 ${all.length} 筆。`);
  }

  const pages = all.filter((p) => SYNC_ALL || readSelect(p.properties, '狀態') === '已發布');
  console.log(`✅ 其中要同步的有 ${pages.length} 篇${SYNC_ALL ? '（--all：不分狀態）' : '（狀態=已發布）'}。`);

  if (DEBUG) debugDump.pages = all;

  if (pages.length === 0) {
    console.log('目前沒有要同步的文章。若要測試，可加 --all 參數。');
    if (DEBUG) fs.writeFileSync(path.join(ROOT, 'notion-debug.json'), JSON.stringify(debugDump, null, 2));
    return;
  }

  backupPosts();
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  if (PRUNE_ALL) {
    for (const f of fs.readdirSync(POSTS_DIR)) {
      if (f.endsWith('.md')) fs.unlinkSync(path.join(POSTS_DIR, f));
    }
    console.log('🧹 已清空 src/content/posts（--prune-all）');
  }

  const NOW = new Date();
  const scheduled = [];   // 已排定但時間還沒到的

  // 先算好每篇的 slug，才能做上一篇/下一篇
  const prepared = [];
  for (const page of pages) {
    const props = page.properties;
    const title = readTitle(props, '標題') || '未命名';
    const rawSlug = readText(props, 'Slug');
    if (!rawSlug) {
      console.warn(`⚠️  《${title}》沒有填 Slug 欄位，已略過。請到 Notion 補上純英文 slug。`);
      continue;
    }
    const slug = safeSlug(rawSlug);
    if (!slug) {
      console.warn(`⚠️  《${title}》的 Slug「${rawSlug}」清洗後是空的，已略過。`);
      continue;
    }
    // 預約發布：填了未來的「發布時間」就先不產出，等時間到的那次同步才會上線。
    // 沒填發布時間 = 立即發布。
    const publishAt = readDate(props, '發布時間');
    if (publishAt && publishAt.getTime() > NOW.getTime()) {
      scheduled.push({ title, publishAt });
      continue;
    }

    prepared.push({
      page, props, title, slug,
      code: readText(props, '排序碼').trim().toUpperCase(),
      publishAt,
    });
  }

  // 排序碼格式：字母 + 四位數字，例如 A0001。
  //   A = 越後大地藝術祭　B = 富士搖滾二三事　C = 我吃的不只是飯　D = 里山人文和風土
  // 字母代表「系列」，數字是系列內的閱讀順序。
  // 「上一站／下一站」只在同一個字母內串接——A 系列的最後一篇不會接到 B 系列的第一篇。
  const seriesOf = (x) => (x.code ? x.code[0] : '');

  prepared.sort((a, b) => {
    if (a.code && b.code) return a.code.localeCompare(b.code);
    if (a.code) return -1;   // 沒填排序碼的排在最後
    if (b.code) return 1;
    return String(a.page.created_time || '').localeCompare(String(b.page.created_time || ''));
  });

  if (scheduled.length) {
    const fmt = (d) => d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
    console.log(`\n⏳ 預約中（時間到才會上線，共 ${scheduled.length} 篇）：`);
    for (const x of scheduled) console.log(`   ${fmt(x.publishAt)}　${x.title}`);
  }

  for (const x of prepared) {
    if (!x.code) console.warn(`⚠️  《${x.title}》沒有填排序碼，會排在最後，也不會有上一篇／下一篇。`);
  }
  console.log('\n📑 順序：' + prepared.map((x) => `${x.code || '（未編號）'} ${x.title}`).join('　│　'));

  const seen = new Set();
  for (const item of prepared) {
    if (seen.has(item.slug)) {
      console.warn(`⚠️  slug 重複：${item.slug}（《${item.title}》），後面那篇會蓋掉前面那篇。`);
    }
    seen.add(item.slug);
  }

  // 只有同一個系列（排序碼首字母相同）才互相串接
  const sameSeries = (i, step) => {
    const cur = prepared[i];
    const neighbour = prepared[i + step];
    if (!cur.code || !neighbour) return '';
    return seriesOf(neighbour) === seriesOf(cur) ? neighbour.slug : '';
  };

  const written = [];

  for (let i = 0; i < prepared.length; i++) {
    const { page, props, title, slug } = prepared[i];
    console.log(`\n📄 處理中：《${title}》 → ${slug}.md`);

    // 先清空這篇的圖片資料夾：Notion 刪圖或換圖後，舊檔不該留在網站上
    const imgDir = path.join(IMAGES_DIR, slug);
    if (fs.existsSync(imgDir)) {
      for (const f of fs.readdirSync(imgDir)) {
        try { fs.rmSync(path.join(imgDir, f), { force: true }); } catch { /* 略過 */ }
      }
    }

    const blocks = REPLAY ? (replayBlocks[slug] || []) : await fetchBlocks(page.id);
    if (DEBUG) debugDump.blocks[slug] = blocks;

    const ctx = { imageIndex: 0, lead: '', cover: '' };
    const body = (await blocksToMarkdown(blocks, slug, ctx)).trim();

    // 紀念章：日本各地景點的蓋章，是「我真的到過那裡」的證據。
    const stampDir = path.join(STAMPS_DIR, slug);
    if (fs.existsSync(stampDir)) {
      for (const f of fs.readdirSync(stampDir)) {
        try { fs.rmSync(path.join(stampDir, f), { force: true }); } catch { /* 略過 */ }
      }
    }
    const stamps = [];
    const stampUrls = readFiles(props, '紀念章');
    for (let n = 0; n < stampUrls.length; n++) {
      const base = `stamp-${String(n + 1).padStart(2, '0')}`;
      try {
        const filename = await downloadImage(stampUrls[n], stampDir, base, 800);
        stamps.push(`/images/stamps/${slug}/${filename}`);
        console.log(`   🖃  已下載紀念章：${filename}`);
      } catch (err) {
        console.error(`   ❌ 紀念章下載失敗（${base}）：${err.message}`);
      }
    }

    const category = readMulti(props, '分類');
    const location = readSelect(props, '地點');
    const season = readMulti(props, '季節');
    const postType = readSelect(props, '攻略類型');
    const artist = readMulti(props, '藝術家');
    const artworkNumber = readText(props, '作品編號');
    const artworkName = readText(props, '作品名稱');
    const status = readSelect(props, '狀態') || '已發布';
    const threads = readText(props, '對應Threads');

    // 顯示日期優先用「發布時間」，沒填才退回 Notion 頁面建立時間。
    // 一定要用台北時區格式化：台灣時間 8/20 00:00 換算成 UTC 是 8/19 16:00，
    // 直接用 toISOString() 會整整少一天。（sv-SE 的日期格式剛好就是 YYYY-MM-DD）
    const date = prepared[i].publishAt
      ? prepared[i].publishAt.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
      : (page.created_time || '').slice(0, 10);

    const fm = [
      '---',
      `title: ${yaml(title)}`,
      `category: ${yamlList(category)}`,
      location ? `location: ${yaml(location)}` : null,
      season.length ? `season: ${yamlList(season)}` : null,
      postType ? `postType: ${yaml(postType)}` : null,
      artist.length ? `artist: ${yamlList(artist)}` : null,
      artworkNumber ? `artworkNumber: ${yaml(artworkNumber)}` : null,
      artworkName ? `artworkName: ${yaml(artworkName)}` : null,
      prepared[i].code ? `code: ${yaml(prepared[i].code)}` : null,
      stamps.length ? `stamps: ${yamlList(stamps)}` : null,
      ctx.cover ? `cover: ${yaml(ctx.cover)}` : null,
      `status: ${yaml(status)}`,
      ctx.lead ? `lead: ${yaml(ctx.lead)}` : null,
      date ? `date: ${date}` : null,
      `prevSlug: ${yaml(sameSeries(i, -1))}`,
      `nextSlug: ${yaml(sameSeries(i, +1))}`,
      threads ? `threads: ${yaml(threads)}` : null,
      '---',
      '',
    ].filter(Boolean).join('\n');

    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, fm + '\n' + body + '\n', 'utf-8');
    written.push(`${slug}.md`);
    console.log(`   ✅ 已寫入 src/content/posts/${slug}.md（${body.length} 字、${ctx.imageIndex} 張圖）`);
    if (body.length < 120) {
      console.warn(`   ⚠️  《${title}》內文只有 ${body.length} 字——這篇在 Notion 上可能還沒寫完，但狀態是「已發布」，網站上會出現一頁空的。`);
    }
  }

  // 依照上次的清單，刪掉這次 Notion 已經沒有的文章（只碰同步產生過的檔案）
  if (fs.existsSync(MANIFEST)) {
    try {
      const prev = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8')).files || [];
      for (const f of prev) {
        if (!written.includes(f)) {
          const p = path.join(POSTS_DIR, f);
          if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`🗑️  已移除（Notion 上已不存在或未發布）：${f}`); }
        }
      }
    } catch { /* manifest 壞掉就略過 */ }
  }
  fs.writeFileSync(MANIFEST, JSON.stringify({ updatedAt: new Date().toISOString(), files: written }, null, 2));

  // public/images/posts/ 底下每個資料夾都對應一篇文章。
  // 文章在 Notion 被刪掉或改回草稿後，它的圖片資料夾也該跟著消失，
  // 否則網站上會累積永遠沒人引用的孤兒圖片。
  const liveSlugs = new Set(prepared.map((x) => x.slug));
  for (const root of [IMAGES_DIR, STAMPS_DIR]) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root)) {
      const full = path.join(root, dir);
      if (!fs.statSync(full).isDirectory() || liveSlugs.has(dir)) continue;
      try {
        fs.rmSync(full, { recursive: true, force: true });
        console.log(`🗑️  已移除孤兒資料夾：${path.relative(ROOT, full)}`);
      } catch { /* 略過 */ }
    }
  }

  if (DEBUG) {
    fs.writeFileSync(path.join(ROOT, 'notion-debug.json'), JSON.stringify(debugDump, null, 2));
    console.log('\n🐞 已輸出 notion-debug.json');
  }

  console.log(`\n🎉 同步完成，共 ${written.length} 篇。`);
}

main().catch((err) => {
  const code = err.code || '';

  if (code === 'unauthorized' || err.status === 401) {
    console.error('\n❌ Notion 拒絕這組 API 金鑰（401 unauthorized）。');
    console.error('   這不是程式的問題，是 .env 裡的 NOTION_TOKEN 已經失效或被撤銷。');
    console.error('\n   請這樣換一組新的：');
    console.error('   1. 開 https://www.notion.so/profile/integrations');
    console.error('   2. 點進「echigo-fan-website」→ Configuration 分頁');
    console.error('   3. Internal Integration Secret 按 Show → Regenerate（或直接複製現有的）');
    console.error('   4. 把新的 ntn_... 貼進專案根目錄的 .env，取代 NOTION_TOKEN= 後面那串');
    console.error('   5. 回到 Access 分頁，確認「越後飯・行腳筆記」資料庫還在授權清單裡');
    console.error('   6. 重跑一次 npm run sync -- --debug');
    process.exitCode = 1;
    return;
  }

  if (code === 'object_not_found') {
    console.error('\n❌ Notion 找得到金鑰，但找不到這個資料庫（object_not_found）。');
    console.error('   多半是整合還沒被加進「越後飯・行腳筆記」資料庫。');
    console.error('   到 Notion 打開該資料庫 → 右上「...」→ 連線 → 加入 echigo-fan-website。');
    process.exitCode = 1;
    return;
  }

  console.error('\n❌ 執行過程發生錯誤：', err.message);
  if (code) console.error('   錯誤代碼：', code);
  if (err.body) console.error('   API 回應：', typeof err.body === 'string' ? err.body : JSON.stringify(err.body));
  console.error('\n完整堆疊：\n', err.stack);
  process.exitCode = 1;
});
