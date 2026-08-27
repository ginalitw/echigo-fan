// 網站可能掛在子路徑底下（例如 GitHub Pages 的 /echigo-fan/），
// Astro 不會自動幫站內連結加前綴，所以所有站內路徑都要經過這個函式。
// 之後換成根網域時，只要把 astro.config.mjs 的 base 改成 '/'，這裡不用動。
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : `/${path}`);
}
