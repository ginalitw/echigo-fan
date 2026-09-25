// 給 AI 與搜尋引擎讀的結構化資料。
// 目的很單純：讓機器知道「越後飯」是一個可指認的東西，而不是一堆沒有主人的網頁。
// 人看不到這些內容，所以改這裡不會動到版面。

export const SITE = 'https://echigo.fans';
export const BRAND = '越後飯 ECHIGO FAN';

// 對外帳號。sameAs 是實體消歧的關鍵：
// 它告訴機器「這個網站」跟「這些帳號」是同一個人在經營。
export const SAME_AS = [
  'https://www.threads.net/@echigo.fan',
  'https://www.instagram.com/echigo.fan',
  'https://www.facebook.com/groups/119131948168427',
];

export const publisher = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: BRAND,
  alternateName: ['越後飯', 'ECHIGO FAN'],
  url: `${SITE}/`,
  sameAs: SAME_AS,
  description: '新潟越後妻有與富士搖滾音樂祭的繁體中文第一手內容。追過了，才帶你去。',
  image: `${SITE}/images/about/afan-tanada.webp`,
};

export const website = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: BRAND,
  inLanguage: 'zh-Hant',
  publisher: { '@id': `${SITE}/#org` },
};

/** 文章頁用。datePublished 缺就退回 dateModified，兩個都缺就不輸出日期欄位。 */
export function articleLd(opts: {
  headline: string;
  canonical: string;
  description?: string;
  image?: string;
  updated?: Date;
  section?: string;
}) {
  const iso = opts.updated ? toISODate(opts.updated) : undefined;
  return {
    '@type': 'Article',
    headline: opts.headline,
    inLanguage: 'zh-Hant',
    mainEntityOfPage: opts.canonical,
    url: opts.canonical,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: absolute(opts.image) } : {}),
    ...(iso ? { datePublished: iso, dateModified: iso } : {}),
    ...(opts.section ? { articleSection: opts.section } : {}),
    author: { '@id': `${SITE}/#org` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function absolute(path: string): string {
  return path.startsWith('http') ? path : new URL(path, `${SITE}/`).href;
}

/** 把整包 JSON-LD 包成一個 @graph，一頁只出一個 script。 */
export function graph(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
