// 文章清單的共用邏輯。首頁與四個分類頁（分類／地點／季節／藝術家）都用這裡，
// 避免每個頁面各排各的、順序不一致。
type Post = { data: { date?: Date; code?: string; title: string } };

/** 新的排前面。沒有發布時間的用排序碼當備援，再沒有就用標題。 */
export function byNewest(a: Post, b: Post): number {
  const ad = a.data.date ? +new Date(a.data.date) : 0;
  const bd = b.data.date ? +new Date(b.data.date) : 0;
  if (ad !== bd) return bd - ad;
  const ac = a.data.code || '';
  const bc = b.data.code || '';
  if (ac !== bc) return bc.localeCompare(ac);
  return a.data.title.localeCompare(b.data.title);
}

/** 顯示用的日期字串，例如 2026.08.27。一律用台北時區，避免差一天。 */
export function formatDate(d?: Date): string {
  if (!d) return '';
  return new Date(d)
    .toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
    .replace(/-/g, '.');
}
