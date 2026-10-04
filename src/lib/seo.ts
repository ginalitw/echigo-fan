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

// 文章的作者。用筆名「阿飯」：越後飯的吉祥物，也是每篇第一手紀錄背後那個實際走過的人。
// E-E-A-T 的 Experience 要落在「人」身上，品牌本身不會去旅行。
export const author = {
  '@type': 'Person',
  '@id': `${SITE}/#afan`,
  name: '阿飯',
  alternateName: 'A-Fan',
  url: `${SITE}/about/`,
  image: `${SITE}/images/about/afan-tanada.webp`,
  description: '越後飯 ECHIGO FAN 的筆名作者。年年追富士搖滾，也一季一季回到越後妻有，寫親自走過的路線與作品。',
  memberOf: { '@id': `${SITE}/#org` },
  sameAs: SAME_AS.slice(0, 2),
};

export const website = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: BRAND,
  inLanguage: 'zh-Hant',
  publisher: { '@id': `${SITE}/#org` },
};

/**
 * 文章頁用。
 * datePublished 用實際發布（走訪）日 published；dateModified 用最後查核日 updated。
 * 任一缺就用另一個補；兩個都缺就不輸出日期欄位，不補假日期。
 */
export function articleLd(opts: {
  headline: string;
  canonical: string;
  description?: string;
  image?: string;
  published?: Date;
  updated?: Date;
  section?: string;
  /** 文章寫的作品（藝術祭作品頁用） */
  work?: { name: string; alternateName?: string; identifier?: string; creators?: string[] };
  /** 文章所在地點，例如「中里」 */
  place?: string;
  keywords?: string[];
}) {
  const pub = opts.published ?? opts.updated;
  const mod = opts.updated ?? opts.published;
  const w = opts.work;
  return {
    '@type': 'Article',
    headline: opts.headline,
    inLanguage: 'zh-Hant',
    mainEntityOfPage: opts.canonical,
    url: opts.canonical,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: absolute(opts.image) } : {}),
    ...(pub ? { datePublished: toISODateTime(pub) } : {}),
    ...(mod ? { dateModified: toISODateTime(mod) } : {}),
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(w
      ? {
          about: {
            '@type': 'CreativeWork',
            name: w.name,
            ...(w.alternateName && w.alternateName !== w.name ? { alternateName: w.alternateName } : {}),
            ...(w.identifier ? { identifier: w.identifier } : {}),
            ...(w.creators?.length ? { creator: w.creators.map((name) => ({ '@type': 'Thing', name })) } : {}),
          },
        }
      : {}),
    ...(opts.place
      ? {
          contentLocation: {
            '@type': 'Place',
            name: opts.place,
            address: { '@type': 'PostalAddress', addressRegion: '新潟県', addressCountry: 'JP' },
          },
        }
      : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
    author: { '@id': `${SITE}/#afan` },
    publisher: { '@id': `${SITE}/#org` },
  };
}

/** 結構化資料用：Google 要求日期帶時區，統一用日本時間的當天 00:00。 */
export function toISODateTime(d: Date) {
  return `${toISODate(d)}T00:00:00+09:00`;
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

/** 麵包屑：讓搜尋結果顯示「富士搖滾攻略 › 交通與移動」這種層級。 */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absolute(it.url),
    })),
  };
}

/** 主題頁、目錄頁用：告訴搜尋引擎這頁是一組文章的集合。 */
export function collectionLd(opts: { name: string; url: string; description?: string; items: { name: string; url: string }[] }) {
  return {
    '@type': 'CollectionPage',
    name: opts.name,
    url: absolute(opts.url),
    inLanguage: 'zh-Hant',
    ...(opts.description ? { description: opts.description } : {}),
    isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: absolute(it.url),
      })),
    },
  };
}
