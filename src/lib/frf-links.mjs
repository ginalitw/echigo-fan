// 富士搖滾文章裡的站內連結：連結文字一律換成「目標文章現在的標題」。
//
// 為什麼：Notion 裡的連結文字是寫文章當時打的，常帶「#02」「# 05」這種編號（網站不顯示編號），
// 標題改過之後也不會跟著變（例如「#02 新手預算：到底準備多少才夠？」其實已經改名）。
// 只動指向 /fujirock/<文章 slug>/ 的連結；主題頁、外部網站、越後飯文章的連結都不動。
import fs from 'node:fs';
import path from 'node:path';

/** 和 src/lib/frf.ts 的 displayTitle 一樣：拿掉 Notion 標題前面的「# 02」 */
export function displayTitle(title) {
  return String(title ?? '').replace(/^[#＃]\s*\d+\s*/, '').trim();
}

/** 連結文字前面的「#02」「# 05」「＃ 08」 */
export const NUMBER_PREFIX = /^\s*[#＃]\s*\d{1,2}\s*/;

/** 從 src/content/frf/*.md 的 frontmatter 讀 slug → 顯示標題。 */
export function loadFrfTitles(dir = path.join(process.cwd(), 'src/content/frf')) {
  const titles = new Map();
  if (!fs.existsSync(dir)) return titles;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const fm = src.match(/^---\n([\s\S]*?)\n---/);
    const line = fm && fm[1].match(/^title:\s*(.+)$/m);
    if (!line) continue;
    let t = line[1].trim();
    if (/^["']/.test(t)) {
      try { t = JSON.parse(t.replace(/^'(.*)'$/, '"$1"')); } catch { t = t.slice(1, -1); }
    }
    titles.set(f.replace(/\.md$/, ''), displayTitle(t));
  }
  return titles;
}

const FRF_HREF = /^(?:https?:\/\/(?:www\.)?echigo\.fans)?\/fujirock\/([a-z0-9][a-z0-9-]*)\/?(#.*)?$/i;

/** 連結指向哪一篇富士搖滾文章（不管網站上有沒有這篇）；主題頁、外部連結回 null。 */
export function frfSlugOf(href) {
  const m = String(href ?? '').match(FRF_HREF);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  if (slug === 'topic' || slug === 'audience' || slug === 'upgrade') return null;
  return slug;
}

/** 這個連結應該顯示的文字；不用換就回 null。 */
export function frfLinkText(href, text, titles) {
  const slug = frfSlugOf(href);
  if (!slug) return null;
  const stripped = String(text).replace(NUMBER_PREFIX, '').trim();
  const want = titles.get(slug);
  // 連到文章裡某一段（#錨點）時，原文通常寫的是段落名稱；文章還沒上線時也查不到標題。
  // 這兩種只拿掉編號，不整句換掉。
  if (/#./.test(String(href)) || !want) return stripped && stripped !== text ? stripped : null;
  return want !== text ? want : null;
}

const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));
const hasMedia = (n) => n.type === 'element' && (n.tagName === 'img' || (n.children || []).some(hasMedia));

/**
 * rehype：只處理富士搖滾文章（src/content/frf/）。
 * options.titles 可以直接給 Map（測試用），不給就從 src/content/frf 讀。
 */
export function rehypeFrfLinks(options = {}) {
  let titles = options.titles || null;
  return (tree, file) => {
    const where = String(file?.path || file?.history?.[0] || '').replace(/\\/g, '/');
    if (!options.titles && !where.includes('/content/frf/')) return;
    if (!titles) titles = loadFrfTitles();
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && !hasMedia(node)) {
        const next = frfLinkText(node.properties?.href, textOf(node), titles);
        if (next) node.children = [{ type: 'text', value: next }];
        return;
      }
      for (const c of node.children || []) walk(c);
    };
    walk(tree);
  };
}

/** 同樣的規則套在 markdown 原文上（給 FAQPage 結構化資料用，跟頁面上看到的文字一致）。 */
export function rewriteFrfLinksMd(markdown, titles) {
  return String(markdown ?? '').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, text, href) => {
    const next = frfLinkText(href, text, titles);
    return next ? `[${next}](${href})` : all;
  });
}
