// 通知 IndexNow（Bing、Yandex 等）網站有更新，讓它們盡快重新抓取。
// ChatGPT 搜尋與 Copilot 大量依賴 Bing 的索引，這一步是 AIO 的入口。
//
// 金鑰檔放在 public/296af1ed37ec411a710978f99d611d8b.txt，部署後會出現在 https://echigo.fans/296af1ed37ec411a710978f99d611d8b.txt，
// IndexNow 靠它確認「發通知的人真的是網站主人」。換金鑰時兩邊一起換。
//
// 用法：node scripts/indexnow.mjs        送出 sitemap 裡的全部網址
// 只在內容真的有變化時才跑（見 deploy.yml），避免每小時重複通知。

const SITE = 'https://echigo.fans';
const KEY = '296af1ed37ec411a710978f99d611d8b';

const res = await fetch(`${SITE}/sitemap.xml`);
if (!res.ok) {
  console.warn(`⚠️  讀不到 sitemap（${res.status}），這次不通知。`);
  process.exit(0);
}
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));
if (!urls.length) {
  console.warn('⚠️  sitemap 裡沒有網址，這次不通知。');
  process.exit(0);
}

const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'echigo.fans', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
// 200／202 都是收到。失敗不擋部署，只記錄。
console.log(`IndexNow：送出 ${urls.length} 個網址，回應 ${r.status}`);
