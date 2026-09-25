import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOPICS } from '../lib/frf';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('posts');
  const frf = await getCollection('frf');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  // 尾斜線正規化：GitHub Pages 會把 /posts/xxx 301 導到 /posts/xxx/，
  // sitemap 若給沒斜線的版本，Google 會報「頁面會重新導向」而不收錄。
  // 在這裡統一補上，呼叫端有沒有寫斜線都一樣（已有斜線的不受影響）。
  const abs = (path: string) => {
    const p = path === '/' ? '/' : path.endsWith('/') ? path : path + '/';
    return new URL(base + p, site).href;
  };
  const uniq = (arr: (string | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => Boolean(x)))];

  const entries: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: abs('/'), priority: '1.0' },
    { loc: abs('/fujirock/'), priority: '0.9' },
    { loc: abs('/fujirock/upgrade/'), priority: '0.7' },
    ...TOPICS.map((t) => ({ loc: abs(`/fujirock/topic/${t.id}/`), priority: '0.7' })),
    ...frf.map((p) => ({
      loc: abs(`/fujirock/${p.slug}/`),
      priority: '0.8',
    })),
    { loc: abs('/about'), priority: '0.6' },
    { loc: abs('/archive'), priority: '0.7' },
    ...posts.map((p) => ({
      loc: abs(`/posts/${p.slug}`),
      lastmod: p.data.date
        ? new Date(p.data.date).toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })
        : undefined,
      priority: '0.8',
    })),
    ...uniq(posts.flatMap((p) => p.data.category ?? [])).map((c) => ({
      loc: abs(`/category/${encodeURIComponent(c)}`), priority: '0.6',
    })),
    ...uniq(posts.map((p) => p.data.location)).map((l) => ({
      loc: abs(`/location/${encodeURIComponent(l)}`), priority: '0.5',
    })),
    ...uniq(posts.flatMap((p) => p.data.season ?? [])).map((s) => ({
      loc: abs(`/season/${encodeURIComponent(s)}`), priority: '0.5',
    })),
    ...uniq(posts.flatMap((p) => p.data.artist ?? [])).map((a) => ({
      loc: abs(`/artist/${encodeURIComponent(a)}`), priority: '0.5',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
