import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SAME_AS, MAP_URL } from '../lib/seo';

// 給 AI 讀的網站說明（llmstxt.org 格式）。
// 跟 sitemap 一樣每次建置時從內容自動產生，新文章同步進來就會自己出現，不用手動維護。
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (p: string) => new URL(base + (p.endsWith('/') ? p : p + '/'), site).href;
  const clean = (t: string) => t.replace(/^#\s*\d+\s*/, '').trim();

  const frf = (await getCollection('frf')).sort((a, b) => a.slug.localeCompare(b.slug));
  const posts = (await getCollection('posts')).sort(
    (a, b) => (a.data.code ?? a.slug).localeCompare(b.data.code ?? b.slug),
  );

  const frfLines = frf.map((p) => `- [${clean(p.data.title)}](${abs(`/fujirock/${p.slug}`)})${p.data.meta ? `: ${p.data.meta}` : ''}`);
  const postLines = posts.map((p) => {
    const d = p.data;
    const facts = [d.artworkName && d.artworkName !== d.title ? d.artworkName : '', (d.artist ?? []).join('、'), d.location]
      .filter(Boolean)
      .join('，');
    return `- [${d.title}](${abs(`/posts/${p.slug}`)})${facts || d.lead ? `: ${[facts, d.lead].filter(Boolean).join('。')}` : ''}`;
  });

  const body = `# 越後飯 ECHIGO FAN

> 繁體中文的新潟第一手內容站。寫越後妻有「大地藝術祭」的作品與路線，以及富士搖滾音樂祭（FUJI ROCK FESTIVAL，新潟苗場）的實用攻略。內容都來自作者親自走過的紀錄。追過了，才帶你去。

- 作者：阿飯（筆名），年年參加富士搖滾，並在不同季節反覆回到越後妻有
- 語言：繁體中文（台灣用語）
- 社群：${SAME_AS.slice(0, 2).join('、')}
- 本站不販售行程，也不代訂票券

## 富士搖滾攻略

${frfLines.join('\n')}

## 越後妻有大地藝術祭：實地紀錄

${postLines.join('\n')}

## 其他

- [關於越後飯](${abs('/about')}): 這個網站是誰在寫、為什麼寫
- [大地藝術祭 2026 作品地圖](${MAP_URL}): 越後妻有 231 件常設與公開作品的開館日曆與路線規劃（開車、步行、巴士）
- [富士搖滾攻略首頁](${abs('/fujirock')})
- [Sitemap](${new URL(base + '/sitemap.xml', site).href})
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
