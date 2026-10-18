// 文章開頭的「本篇適合」提示框和「閱讀時間」那一行，改成標題下方的小標籤。
//
// Notion 裡的寫法照舊（不用改）：
//   > 👤 **本篇適合：** 🔰 新手首衝（預算有限、想用最低成本去一次音樂祭的人）
//     **⏱ 閱讀時間：** 約 6 分鐘
// 這個外掛把它們從內文拿出來，放進 frontmatter 的 frfWho／frfRead，文章頁樣板印成標籤。
// 「本篇適合：」後面是空的就什麼都不顯示，不會留下空框。
// 只看第一個標題之前的開頭區，內文其他地方的提示框不動。

const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));
const LEAD_DECOR = /^[\s\p{Extended_Pictographic}\uFE0F\u200D]*/u;
const WHO = /^[\s\p{Extended_Pictographic}\uFE0F\u200D]*本篇適合\s*[：:]\s*/u;
const READ = /^[\s\p{Extended_Pictographic}\uFE0F\u200D]*閱讀時間\s*[：:]\s*/u;
const isHeading = (n) => n?.type === 'element' && /^h[1-6]$/.test(n.tagName);

/** 「🔰 新手首衝 ／ 🌐 通用必修（第一次去的人）」→ { tags: ['🔰 新手首衝', '🌐 通用必修'], note: '第一次去的人' } */
export function parseWho(raw) {
  let s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  let note = '';
  // 結尾的（說明）；沒寫右括號也算
  const paren = s.match(/[（(]([^（）()]*)[）)]?\s*$/);
  if (paren) {
    note = paren[1].trim();
    s = s.slice(0, paren.index).trim();
  }
  const tags = [];
  const rest = [];
  for (const part of s.split(/\s*[／/｜|＋+]\s*/)) {
    const p = part.trim();
    if (!p) continue;
    const words = p.replace(LEAD_DECOR, '').trim();
    // 開頭有 emoji、字數短的是身分標籤；其他是說明
    if (words && words.length <= 8 && words !== p) tags.push(p);
    else if (words) rest.push(words);
  }
  note = [...rest, note].filter(Boolean).join('，');
  if (!tags.length && !note) return null;
  return { tags, note };
}

/** 「約 6 分鐘」→「約 6 分鐘」；「依需求跳讀，不需從頭到尾」→「依需求跳讀」 */
export function parseRead(raw) {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const m = s.match(/約?\s*\d+\s*(?:～|~|-|–)?\s*\d*\s*分鐘/);
  if (m) return m[0].replace(/^(\d)/, '約 $1').replace(/^約(\d)/, '約 $1').trim();
  return s.split(/[，,。]/)[0].trim().slice(0, 12);
}

export function rehypeFrfWho() {
  return (tree, file) => {
    const where = String(file?.path || file?.history?.[0] || '').replace(/\\/g, '/');
    if (!where.includes('/content/frf/')) return;
    const kids = tree.children || [];
    const stop = kids.findIndex(isHeading);
    const end = stop === -1 ? kids.length : stop;
    let who = null;
    let read = '';
    let sawWho = false;
    const drop = new Set();
    for (let i = 0; i < end; i++) {
      const n = kids[i];
      if (n.type !== 'element') continue;
      if (n.tagName === 'blockquote' && WHO.test(textOf(n).trim())) {
        sawWho = true;
        // 提示框裡第一段是「本篇適合」，後面若有「閱讀時間」也在框裡
        const paras = (n.children || []).filter((c) => c.type === 'element');
        const whoText = [];
        for (const p of paras) {
          const t = textOf(p).trim();
          if (READ.test(t)) read = parseRead(t.replace(READ, ''));
          else whoText.push(t);
        }
        who = parseWho(whoText.join(' ').replace(WHO, ''));
        drop.add(n);
        continue;
      }
      if (n.tagName === 'p' && READ.test(textOf(n).trim())) {
        read = parseRead(textOf(n).trim().replace(READ, ''));
        drop.add(n);
      }
    }
    if (!drop.size) return;
    tree.children = kids.filter((n) => !drop.has(n));
    const fm = file?.data?.astro?.frontmatter;
    if (fm) {
      if (who) fm.frfWho = who;
      if (read) fm.frfRead = read;
      if (sawWho) fm.frfWhoSeen = true;
    }
  };
}
