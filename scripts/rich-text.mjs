/** Shared by sync-from-notion.mjs and sync-frf-from-notion.mjs */

export function wrapMark(text, mark) {
  const matched = String(text ?? '').match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!matched) return text;
  const [, lead, core, tail] = matched;
  if (!core) return text;
  return `${lead}${mark}${core}${mark}${tail}`;
}

export function richText(arr) {
  if (!arr || arr.length === 0) return '';

  const key = (rt) => {
    const a = rt.annotations || {};
    const href = rt.href || rt.text?.link?.url || '';
    return [a.bold, a.italic, a.strikethrough, a.code, href].join('|');
  };
  const merged = [];
  for (const rt of arr) {
    const last = merged[merged.length - 1];
    if (last && key(last) === key(rt)) {
      last.plain_text += rt.plain_text ?? '';
    } else {
      merged.push({ ...rt, plain_text: rt.plain_text ?? '' });
    }
  }

  return merged.map((rt) => {
    let text = rt.plain_text;
    const a = rt.annotations || {};
    if (a.code) text = wrapMark(text, '`');
    if (a.bold) text = wrapMark(text, '**');
    if (a.italic) text = wrapMark(text, '*');
    if (a.strikethrough) text = wrapMark(text, '~~');
    const href = rt.href || rt.text?.link?.url;
    if (href) text = `[${text.trim()}](${href})`;
    return text;
  }).join('');
}
