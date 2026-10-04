import { defineConfig } from 'astro/config';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://echigo.fans';
const BASE = '/';

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  return (node.children || []).map(textOf).join('');
}

function setText(node, value) {
  node.children = [{ type: 'text', value }];
}

function isHeading(node) {
  return node?.type === 'element' && /^h[1-6]$/.test(node.tagName);
}

function stripDecor(s) {
  return String(s)
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u20E3\s]+/u, '')
    .trim();
}

function rehypePrefixBase() {
  const prefix = BASE === '/' ? '' : BASE.replace(/\/$/, '');
  return (tree) => {
    if (!prefix) return;
    const walk = (node) => {
      if (node.type === 'element' && node.properties) {
        for (const attr of ['src', 'href']) {
          const v = node.properties[attr];
          if (
            typeof v === 'string' &&
            v.startsWith('/') &&
            !v.startsWith('//') &&
            !v.startsWith(`${prefix}/`)
          ) {
            node.properties[attr] = prefix + v;
          }
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}

function rehypeFixBoldStars() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'text' && node.value) {
        node.value = node.value
          .replace(/\*\*\*\*/g, '')
          .replace(/\*\*(\S(?:[\s\S]*?\S)?)\s+\*\*/g, '$1')
          .replace(/\*\*(\S(?:[\s\S]*?\S)?)\*\*/g, '$1');
      }
      if (node.type === 'element' && node.tagName === 'strong') {
        for (const child of node.children || []) {
          if (child.type === 'text' && child.value) {
            child.value = child.value.replace(/\*+/g, '');
          }
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}

function isFaqDoc(tree, file) {
  const path = String(file?.path || file?.history?.join(' ') || '');
  if (path.includes('beginner-faq')) return true;
  const headings = (tree.children || [])
    .filter(isHeading)
    .map((n) => stripDecor(textOf(n)));
  return headings.some((t) => t.includes('目錄指引')) && headings.some((t) => t.includes('預算') && t.includes('交通'));
}

function isQuestion(node) {
  if (node?.type !== 'element' || node.tagName !== 'p') return false;
  return /^Q[:：]/.test(textOf(node).replace(/\s+/g, ' ').trim());
}

function rehypeFrfFaq() {
  return (tree, file) => {
    if (!isFaqDoc(tree, file)) return;
    const children = tree.children || [];
    const out = [];
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (!isQuestion(node)) {
        out.push(node);
        continue;
      }
      const body = [];
      let j = i + 1;
      while (j < children.length) {
        const n = children[j];
        if (isQuestion(n) || isHeading(n)) break;
        if (n?.type === 'element' && n.tagName === 'hr') break;
        body.push(n);
        j++;
      }
      out.push({
        type: 'element',
        tagName: 'details',
        properties: { className: ['frf-faq'] },
        children: [
          {
            type: 'element',
            tagName: 'summary',
            properties: {},
            children: node.children || [],
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['frf-faq-body'] },
            children: body,
          },
        ],
      });
      i = j - 1;
    }
    children.length = 0;
    children.push(...out);
  };
}

function rehypeFrfArticle() {
  return (tree) => {
    const children = tree.children || [];
    for (const node of children) {
      if (isHeading(node)) {
        const cleaned = stripDecor(textOf(node));
        if (cleaned) setText(node, cleaned);
      }
    }

    const splice = (startTest, headingOnly, stopExtra, keep) => {
      const out = [];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const hit = headingOnly
          ? isHeading(node) && startTest(textOf(node))
          : node?.type === 'element' && startTest(textOf(node));
        if (hit) {
          const group = [node];
          let j = i + 1;
          while (j < children.length) {
            const n = children[j];
            if (isHeading(n)) break;
            if (stopExtra && stopExtra(n)) break;
            group.push(n);
            j++;
          }
          if (keep) {
            out.push({
              type: 'element',
              tagName: 'aside',
              properties: { className: [keep] },
              children: group,
            });
          }
          i = j - 1;
        } else {
          out.push(node);
        }
      }
      children.length = 0;
      children.push(...out);
    };

    splice((t) => t.includes('懶人重點'), true, null, 'frf-takeaway');
    splice(
      (t) => t.includes('延伸閱讀'),
      true,
      (n) => n.type === 'element' && (n.tagName === 'hr' || n.tagName === 'blockquote'),
      null,
    );
    splice(
      (t) => t.includes('還有問題') || t.includes('加入我們的社群'),
      false,
      (n) => n.type === 'element' && n.tagName === 'hr',
      'frf-signoff',
    );
  };
}


// ── 富士搖滾：標題編號、路線圖、提示框分類 ─────────────────────
const KEYCAP_RE = /^\s*(\d{1,2}|🔟)\uFE0F?\u20E3?\s*/u;
function frfStepHeading(node) {
  if (!isHeading(node)) return;
  const first = node.children?.[0];
  if (!first || first.type !== 'text') return;
  const m = first.value.match(/^\s*(\d)\uFE0F\u20E3\s*/u) || first.value.match(/^\s*(🔟)\s*/u);
  if (!m) return;
  const n = m[1] === '🔟' ? '10' : m[1];
  first.value = first.value.slice(m[0].length);
  node.children.unshift({
    type: 'element', tagName: 'span',
    properties: { className: ['frf-step'], ariaHidden: 'true' },
    children: [{ type: 'text', value: n }],
  });
  node.properties = node.properties || {};
  node.properties.className = [...(node.properties.className || []), 'frf-has-step'];
}

const ARROW_RE = /\s*[➔→➡]\s*/u;
function frfRoute(node) {
  if (node?.type !== 'element' || node.tagName !== 'blockquote') return null;
  const t = textOf(node).trim();
  const parts = t.split(ARROW_RE).map((x) => x.trim()).filter(Boolean);
  if (parts.length < 3 || t.length > 140) return null;
  const stops = parts.map((p) => {
    const dur = (p.match(/[（(]\s*([^）)]+?)\s*[）)]/) || [])[1] || '';
    const name = stripDecor(p.replace(/[（(][^）)]*[）)]/g, '').replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')).replace(/[*]/g, '').trim();
    return { name, dur };
  });
  if (stops.some((s) => !s.name || s.name.length > 16)) return null;
  const items = [];
  stops.forEach((s, i) => {
    items.push({ type: 'element', tagName: 'li', properties: { className: ['frf-route-stop'] }, children: [{ type: 'text', value: s.name }] });
    if (i < stops.length - 1) {
      items.push({ type: 'element', tagName: 'li', properties: { className: ['frf-route-leg'], ariaHidden: 'true' }, children: [{ type: 'text', value: s.dur || '' }] });
    }
  });
  return { type: 'element', tagName: 'ol', properties: { className: ['frf-route'], ariaLabel: '路線：' + stops.map((s) => s.name).join(' → ') }, children: items };
}

const CALLOUT_KIND = [
  [/^[⚠🚫❗‼]/u, 'warn'],
  [/^[💡📝ℹ🔎✨]/u, 'tip'],
  [/^[👤🙋]/u, 'who'],
  [/^[✅👉]/u, 'ok'],
];
function frfCallout(node) {
  if (node?.type !== 'element' || node.tagName !== 'blockquote') return;
  const t = textOf(node).trim();
  const hit = CALLOUT_KIND.find(([re]) => re.test(t));
  if (!hit) return;
  node.properties = node.properties || {};
  node.properties.className = [...(node.properties.className || []), 'frf-callout', 'frf-callout--' + hit[1]];
  // 拿掉開頭那顆 emoji，改由樣式表現類型
  const strip = (n) => {
    if (!n) return false;
    if (n.type === 'text') {
      const v = n.value.replace(/^\s*[\p{Extended_Pictographic}\uFE0F]+\s*/u, '');
      if (v !== n.value) { n.value = v; return true; }
      return n.value.trim() !== '';
    }
    for (const c of n.children || []) { if (strip(c)) return true; }
    return false;
  };
  strip(node);
}

function rehypeFrfDesign() {
  return (tree, file) => {
    const src = String(file?.path || file?.history?.[0] || '').replace(/\\/g, '/');
    if (!src.includes('/content/frf/')) return; // 只處理富士搖滾，不動越後飯文章
    const children = tree.children || [];
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      frfStepHeading(node);
      const route = frfRoute(node);
      if (route) { children[i] = route; continue; }
      frfCallout(node);
      if (node?.type === 'element' && node.tagName === 'aside' && (node.properties?.className || []).includes('frf-takeaway')) {
        node.properties.id = 'takeaway';
        for (const c of node.children || []) frfCallout(c);
      }
    }
    // 巢狀在 h3 等處的 keycap 也處理（例如列表裡的段落標題不動，只處理標題）
    const walk = (n) => { for (const c of n.children || []) { if (isHeading(c)) frfStepHeading(c); walk(c); } };
    walk(tree);
  };
}

// ── 圖片：尺寸、延遲載入、手機小圖 ──────────────────────────────
// 規則要跟 src/lib/img.ts 一致：寬度超過 900px 的圖，建置後多兩份 `-480.webp`、`-800.webp`。
const VARIANT_W = 800;
const WIDTHS = [480, 800];
const IMG_RE = /\.(jpe?g|png|webp)$/i;
const VARIANT_RE = /-(480|800)\.webp$/;
const variantOf = (src, w = VARIANT_W) => src.replace(IMG_RE, `-${w}.webp`);
const srcsetOf = (src, width) => [...WIDTHS.map((w) => `${variantOf(src, w)} ${w}w`), `${src} ${width}w`].join(', ');
const sizeCache = new Map();

async function sizeOf(src) {
  if (sizeCache.has(src)) return sizeCache.get(src);
  const file = path.join(process.cwd(), 'public', decodeURIComponent(src));
  let out = null;
  if (fs.existsSync(file)) {
    const m = await sharp(file).metadata();
    const r = (m.orientation ?? 1) >= 5;
    out = r ? { width: m.height, height: m.width } : { width: m.width, height: m.height };
  }
  sizeCache.set(src, out);
  return out;
}

function rehypeImages() {
  return async (tree) => {
    const imgs = [];
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') imgs.push(node);
      for (const c of node.children || []) walk(c);
    };
    walk(tree);
    await Promise.all(
      imgs.map(async (node) => {
        const p = node.properties || (node.properties = {});
        const src = typeof p.src === 'string' ? p.src : '';
        p.loading = 'lazy';
        p.decoding = 'async';
        if (!src.startsWith('/') || !IMG_RE.test(src)) return;
        const size = await sizeOf(src);
        if (!size) return;
        p.width = size.width;
        p.height = size.height;
        if (size.width > VARIANT_W + 100) {
          p.srcSet = srcsetOf(src, size.width);
          p.sizes = '(max-width: 1000px) 100vw, 960px';
        }
      }),
    );
  };
}

// 越後飯文章：封面圖改在文章頁頂端當主視覺印出，內文裡同一張就拿掉，避免同圖出現兩次。
function rehypeLiftCover() {
  return (tree, file) => {
    const where = String(file?.path || file?.history?.join(' ') || '');
    if (!where.includes('/content/posts/')) return;
    const cover = file?.data?.astro?.frontmatter?.cover;
    if (!cover) return;
    const drop = (parent) => {
      const kids = parent.children || [];
      for (let i = 0; i < kids.length; i++) {
        const n = kids[i];
        if (n.type === 'element' && n.tagName === 'img' && n.properties?.src === cover) {
          kids.splice(i, 1);
          return true;
        }
        if (n.type === 'element' && drop(n)) {
          const left = (n.children || []).filter((c) => !(c.type === 'text' && !c.value.trim()));
          if (n.tagName === 'p' && left.length === 0) kids.splice(i, 1);
          return true;
        }
      }
      return false;
    };
    drop(tree);
  };
}

// 「實際走的資訊」裡「**標籤**：內容」的條列，改排成左標籤、右內容的規格表。
function rehypePracticalSpec() {
  const isPractical = (n) =>
    n.type === 'element' && n.tagName === 'div' && [].concat(n.properties?.className || []).includes('practical');
  const kv = (li) => {
    const kids = li.children || [];
    const first = kids.findIndex((c) => !(c.type === 'text' && !c.value.trim()));
    const head = kids[first];
    const next = kids[first + 1];
    let label;
    let rest;
    if (head?.type === 'element' && head.tagName === 'strong' && next?.type === 'text' && /^\s*[：:「]/.test(next.value)) {
      // 「**位置**：……」或「**作品名**「……」」
      next.value = next.value.replace(/^\s*[：:]\s*/, '');
      label = head.children;
      rest = kids.slice(first + 1);
    } else if (head?.type === 'text') {
      // 「位置：……」（沒加粗也算，但標籤要短、不能含標點，免得把一般句子切開）
      const m = head.value.match(/^\s*([^：:，。、！？「」（）\s]{1,8})[：:]\s*/);
      if (!m) return;
      label = [{ type: 'text', value: m[1] }];
      rest = [{ type: 'text', value: head.value.slice(m[0].length) }, ...kids.slice(first + 1)];
    } else {
      return;
    }
    li.properties = { ...(li.properties || {}), className: ['kv'] };
    li.children = [
      { type: 'element', tagName: 'span', properties: { className: ['k'] }, children: label },
      { type: 'element', tagName: 'div', properties: { className: ['v'] }, children: rest },
    ];
  };
  // 同步腳本寫進 markdown 的 <div class="practical"> 是原始 HTML，
  // 在語法樹裡是開頭、結尾兩個 raw 節點，內容是它們中間的兄弟節點——所以用狀態追蹤。
  const walk = (n, inside) => {
    let here = inside || isPractical(n);
    if (here && n.type === 'element' && n.tagName === 'ul') {
      for (const li of n.children || []) if (li.type === 'element' && li.tagName === 'li') kv(li);
    }
    for (const c of n.children || []) {
      if (c.type === 'raw') {
        if (/class=["']practical["']/.test(c.value)) here = true;
        else if (/<\/div>/.test(c.value) && !inside) here = isPractical(n);
        continue;
      }
      walk(c, here);
    }
  };
  return (tree) => walk(tree, false);
}

// 連續兩張以上、各自獨立成段的圖片，收成一組圖牆（兩欄或三欄）。
// 手機上一張接一張的直式照片會拉得很長，排成圖牆讀者才滑得完。
function rehypeGallery() {
  const onlyImg = (n) => {
    if (n?.type !== 'element' || n.tagName !== 'p') return null;
    const kids = (n.children || []).filter((c) => !(c.type === 'text' && !c.value.trim()));
    return kids.length === 1 && kids[0].type === 'element' && kids[0].tagName === 'img' ? kids[0] : null;
  };
  const blank = (n) => n?.type === 'text' && !n.value.trim();
  const group = (parent) => {
    const kids = parent.children || [];
    const out = [];
    for (let i = 0; i < kids.length; i++) {
      const img = onlyImg(kids[i]);
      if (!img) {
        if (kids[i].type === 'element') group(kids[i]);
        out.push(kids[i]);
        continue;
      }
      const run = [img];
      let j = i + 1;
      while (j < kids.length) {
        if (blank(kids[j])) { j++; continue; }
        const next = onlyImg(kids[j]);
        if (!next) break;
        run.push(next);
        j++;
      }
      if (run.length < 2) { out.push(kids[i]); continue; }
      for (const im of run) {
        if (im.properties?.srcSet) im.properties.sizes = '(max-width: 640px) 50vw, 480px';
      }
      out.push({
        type: 'element',
        tagName: 'div',
        properties: { className: ['gallery', run.length % 3 === 0 && run.length !== 6 ? 'g3' : 'g2'] },
        children: run,
      });
      i = j - 1;
    }
    parent.children = out;
  };
  return (tree) => group(tree);
}

// 表格裡的金額、數字靠右對齊（看預算表時一眼比大小）
function rehypeNumCells() {
  const text = (n) => (n.type === 'text' ? n.value : (n.children || []).map(text).join(''));
  const NUM = /^[\s約~〜≈]*[¥￥$]?\s*(NT\$)?\s*[\d,，.]+(\s*[～~〜–-]\s*[¥￥$]?\s*[\d,，.]+)?\s*(円|元|日圓|日幣|台幣)?\s*$/;
  const mark = (n) => {
    n.properties = { ...(n.properties || {}), className: [...[].concat(n.properties?.className || []), 'num'] };
  };
  const rowsOf = (t) => {
    const out = [];
    const w = (n) => { if (n.type === 'element' && n.tagName === 'tr') out.push(n); else (n.children || []).forEach(w); };
    w(t);
    return out;
  };
  const cells = (tr) => (tr.children || []).filter((c) => c.type === 'element' && (c.tagName === 'td' || c.tagName === 'th'));
  const walk = (n) => {
    if (n.type === 'element' && n.tagName === 'table') {
      const rows = rowsOf(n).map(cells);
      const cols = Math.max(0, ...rows.map((r) => r.length));
      for (let c = 0; c < cols; c++) {
        const body = rows.map((r) => r[c]).filter((x) => x && x.tagName === 'td');
        const numeric = body.filter((x) => NUM.test(text(x)));
        numeric.forEach(mark);
        // 這一欄多數是數字 → 表頭也靠右，跟數字對齊
        if (body.length && numeric.length / body.length >= 0.6) {
          rows.map((r) => r[c]).filter((x) => x && x.tagName === 'th').forEach(mark);
        }
      }
      return;
    }
    for (const c of n.children || []) walk(c);
  };
  return (tree) => walk(tree);
}

function* walkFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkFiles(f);
    else yield f;
  }
}

async function makeVariant(file) {
  if (VARIANT_RE.test(file)) return;
  const m = await sharp(file).metadata();
  const w = (m.orientation ?? 1) >= 5 ? m.height : m.width;
  if (!w || w <= VARIANT_W + 100) return;
  for (const vw of WIDTHS) {
    const out = variantOf(file, vw);
    if (fs.existsSync(out)) continue;
    await sharp(file).rotate().resize({ width: vw }).webp({ quality: vw < 600 ? 72 : 76 }).toFile(out);
  }
}

function imageVariants() {
  return {
    name: 'echigo-image-variants',
    hooks: {
      // 開發模式：小圖不存在就即時產生，本機預覽不會破圖
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const u = decodeURIComponent((req.url || '').split('?')[0]);
          const hit = u.match(VARIANT_RE);
          if (!hit) return next();
          const vw = Number(hit[1]);
          const base = u.slice(0, -hit[0].length);
          const src = ['.webp', '.jpg', '.jpeg', '.png']
            .map((ext) => path.join(process.cwd(), 'public', base + ext))
            .find((f) => fs.existsSync(f));
          if (!src) return next();
          const buf = await sharp(src).rotate().resize({ width: vw }).webp({ quality: 76 }).toBuffer();
          res.setHeader('content-type', 'image/webp');
          res.end(buf);
        });
      },
      // 建置完成：替 dist/images 底下的大圖各產生一份 800px
      'astro:build:done': async ({ dir }) => {
        const root = path.join(fileURLToPath(dir), 'images');
        const files = [...walkFiles(root)].filter((f) => IMG_RE.test(f) && !VARIANT_RE.test(f));
        for (let i = 0; i < files.length; i += 8) {
          await Promise.all(files.slice(i, i + 8).map(makeVariant));
        }
      },
    },
  };
}

export default defineConfig({
  integrations: [imageVariants()],
  site: SITE,
  base: BASE,
  markdown: {
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypePrefixBase, rehypeFixBoldStars, rehypeFrfFaq, rehypeFrfArticle, rehypeFrfDesign, rehypeLiftCover, rehypePracticalSpec, rehypeImages, rehypeGallery, rehypeNumCells],
  },
});
