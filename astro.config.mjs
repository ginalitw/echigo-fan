import { defineConfig } from 'astro/config';

// ---- 網站掛在哪裡 ----
// 目前：GitHub Pages 的專案頁面 → https://ginalitw.github.io/echigo-fan/
// 之後買了 echigo.fan 並綁定後，只要改這兩行：
//   SITE = 'https://echigo.fan'
//   BASE = '/'
// 其他檔案（頁面、同步腳本、Markdown 內容）都不用動。
const SITE = 'https://ginalitw.github.io';
const BASE = '/echigo-fan';

// Markdown 裡的圖片與連結是寫成 /images/... 這種根路徑（保持內容與網址無關），
// 但網站實際掛在子路徑底下，所以在建置階段自動補上前綴。
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

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypePrefixBase],
  },
});
