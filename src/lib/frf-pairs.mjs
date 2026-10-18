// 新手篇／老手篇：同一個編號（Notion 標題的「# 02」）的兩篇，一篇客群是新手、一篇是老手。
// 例如 02 budget-beginner／budget-comfort、04 camping-reality／hotels-and-inns、05 gear-beginner／gear-lightweight。
// 編號只拿來配對，網站上不顯示。

const isBeginner = (a) => (a.audience || []).includes('beginner') && !(a.audience || []).includes('returner');
const isReturner = (a) => (a.audience || []).includes('returner') && !(a.audience || []).includes('beginner');

/** 回傳 { beginner, returner }（兩篇文章），這篇沒有配對就回 null。 */
export function pairOf(list, slug) {
  const me = list.find((a) => a.slug === slug);
  if (!me || !me.n || !(isBeginner(me) || isReturner(me))) return null;
  const same = list.filter((a) => a.n === me.n);
  const beginners = same.filter(isBeginner);
  const returners = same.filter(isReturner);
  // 同號剛好一篇新手、一篇老手才算一對；多於一篇就不猜
  if (beginners.length !== 1 || returners.length !== 1) return null;
  return { beginner: beginners[0], returner: returners[0] };
}

/** 全部配對（給測試和文件用） */
export function allPairs(list) {
  const seen = new Set();
  const out = [];
  for (const a of list) {
    const p = pairOf(list, a.slug);
    if (!p || seen.has(p.beginner.slug)) continue;
    seen.add(p.beginner.slug);
    out.push(p);
  }
  return out;
}
