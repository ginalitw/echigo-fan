/**
 * Notion rich_text → Markdown。sync-from-notion.mjs 與 sync-frf-from-notion.mjs 共用。
 *
 * Notion 一句話裡只要有幾個字另外加了顏色或底線，rich_text 就會拆成好幾段。
 * 以前逐段包 **，會產生「為 ****22:25****，」這種解析不了的 Markdown，
 * 網站上變成粗體裡又包粗體，提醒框把內層粗體當標題，硬生生斷行。
 * 所以這裡先把「Markdown 看得到的樣式」相同的相鄰段落合併，再一次加標記。
 * 顏色、底線 Markdown 表達不了，不參與比對。
 */

export function wrapMark(text, mark) {
  const matched = String(text ?? '').match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!matched) return text;
  const [, lead, core, tail] = matched;
  if (!core) return text;
  return `${lead}${mark}${core}${mark}${tail}`;
}

/** Notion 的 Shift+Enter 換行。輸出成 <br>，不換真的行，表格、清單、引用都不會被拆開。 */
const lineBreaks = (s) => s.replace(/\r?\n/g, '<br>');

const linkOf = (rt) => rt.href || rt.text?.link?.url || '';

const styleKey = (rt) => {
  const a = rt.annotations || {};
  return [!!a.bold, !!a.italic, !!a.strikethrough, !!a.code, linkOf(rt)].join('|');
};

export function richText(arr) {
  if (!arr || arr.length === 0) return '';

  const merged = [];
  for (const rt of arr) {
    const last = merged[merged.length - 1];
    if (last && styleKey(last) === styleKey(rt)) {
      last.plain_text += rt.plain_text ?? '';
    } else {
      merged.push({ ...rt, plain_text: rt.plain_text ?? '' });
    }
  }

  return merged.map((rt) => {
    const a = rt.annotations || {};
    let text = rt.plain_text;
    // 行內程式碼裡的換行沒有意義，換成空白
    if (a.code) text = wrapMark(text.replace(/\r?\n/g, ' '), '`');
    else text = lineBreaks(text);
    if (a.bold) text = wrapMark(text, '**');
    if (a.italic) text = wrapMark(text, '*');
    if (a.strikethrough) text = wrapMark(text, '~~');
    const href = linkOf(rt);
    if (href) text = `[${text.trim().replace(/\[|\]/g, '')}](${href})`;
    return text;
  }).join('');
}

/**
 * 整句要加粗的地方（例如切換清單的標題）。句子裡原本就有粗體的字不再另外包，
 * 否則會變成粗體裡包粗體。
 */
export function richTextBold(arr) {
  const bolded = (arr || []).map((rt) => ({ ...rt, annotations: { ...(rt.annotations || {}), bold: true } }));
  return richText(bolded);
}
