import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ARTICLES } from '../lib/frf';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection('posts');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (path: string) => new URL(base + path, site).href;
  const uniq = (arr: (string | undefined)[]) =>
    [...new Set(arr.filter((x): x is string => Boolean(x)))];

  const entries: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: abs('/'), priority: '1.0' },
    { loc: abs('/fujirock/'), priority: '0.9' },
    { loc: abs('/fujirock/audience/beginner/'), priority: '0.6' },
    { loc: abs('/fujirock/audience/returner/'), priority: '0.6' },
    ...ARTICLES.filter((a) => a.published).map((a) => ({
      loc: abs(`/fujirock/${a.slug}/`),
      priority: '0.8',
    })),
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
