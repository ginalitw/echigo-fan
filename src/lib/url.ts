// 網站可能掛在子路徑底下（例如 GitHub Pages 的 /echigo-fan/），
// Astro 不會自動幫站內連結加前綴，所以所有站內路徑都要經過這個函式。
// 之後換成根網域時，只要把 astro.config.mjs 的 base 改成 '/'，這裡不用動。
//
// 尾斜線：Astro 預設 build.format 是 directory，每頁輸出成 <slug>/index.html，
// 所以正確網址是有尾斜線的。沒有斜線的版本會被 301 導過去，
// 而被導向的網址 Google 不收錄（canonical 也要跟著一致）。
// 圖片等資產檔案不能加斜線，否則會破圖。
const ASSET = /\.(webp|jpe?g|png|gif|svg|ico|xml|txt|pdf|json|css|js)$/i;

export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p === '/') return base + '/';
  if (ASSET.test(p)) return base + p;
  return base + (p.endsWith('/') ? p : p + '/');
}
