export type StageId = "hesitate" | "prep" | "go";
export type AudienceId = "beginner" | "returner" | "common" | "start";
export type TopicId = "planning" | "transport" | "camping" | "onsite" | "food";

export type Article = {
  slug: string;
  n: string;
  title: string;
  meta: string;
  audience: AudienceId[];
  stage: StageId | null;
  topic: TopicId | null;
  topics: string[];
  published: boolean;
  image?: string;
};

export const STAGE_LABEL: Record<StageId, string> = {
  hesitate: "決定要不要去",
  prep: "行前準備",
  go: "現場實用",
};

const STAGE_RANK: Record<StageId, number> = {
  hesitate: 0,
  prep: 1,
  go: 2,
};

export const TOPICS: {
  id: TopicId;
  title: string;
  desc: string;
  preview: string[];
}[] = [
  {
    id: "planning",
    title: "預算與行前",
    desc: "要不要去、花多少、機票住宿門票先弄哪件。",
    preview: ["beginner-faq", "budget-beginner"],
  },
  {
    id: "transport",
    title: "交通與移動",
    desc: "東京到苗場、上野採購、回程湯澤。",
    preview: ["tokyo-to-naeba", "ueno-ameyoko"],
  },
  {
    id: "camping",
    title: "露營與裝備",
    desc: "斜坡、下雨、洗澡、帳篷跟住宿取捨。",
    preview: ["camping-reality", "camping-shower"],
  },
  {
    id: "onsite",
    title: "現場生存",
    desc: "手環、排程、天氣、充電、物販。",
    preview: ["wristband", "timetable-strategy"],
  },
  {
    id: "food",
    title: "飲食與周邊",
    desc: "前夜祭要不要趁早到、苗場哪幾攤值得排。",
    preview: ["naeba-food", "eve-festival"],
  },
];

/** 刻意策劃的入門路徑，不從 Notion 自動抽。 */
export const START_PATH = [
  { slug: "beginner-faq", title: "值不值得去", note: "快速 Q&A" },
  { slug: "budget-beginner", title: "要花多少錢", note: "台幣試算" },
  { slug: "tokyo-to-naeba", title: "怎麼到苗場", note: "交通動線" },
];

export const PILLAR_BY_SLUG: Record<string, TopicId> = {
  "beginner-faq": "planning",
  "before-you-go": "planning",
  "budget-beginner": "planning",
  "budget-comfort": "planning",
  "tokyo-to-naeba": "transport",
  "ueno-ameyoko": "transport",
  "echigo-yuzawa": "transport",
  "camping-reality": "camping",
  "hotels-and-inns": "camping",
  "gear-beginner": "camping",
  "gear-lightweight": "camping",
  "daypack-packing": "camping",
  "festival-chair": "camping",
  "campsite-map": "camping",
  "camping-shower": "camping",
  "decathlon-gear": "camping",
  "weather-defense": "onsite",
  "timetable-strategy": "onsite",
  wristband: "onsite",
  "power-and-signal": "onsite",
  "merch-queue": "onsite",
  "naeba-stages": "onsite",
  "eve-festival": "food",
  "naeba-food": "food",
  "echigo-tsumari": "food",
};

export function displayTitle(title: string) {
  return title.replace(/^#\s*\d+\s*/, "").trim();
}

export function sortByStageThenNumber(list: Article[]) {
  return [...list].sort((a, b) => {
    const sa = a.stage ? STAGE_RANK[a.stage] : 9;
    const sb = b.stage ? STAGE_RANK[b.stage] : 9;
    if (sa !== sb) return sa - sb;
    const na = parseInt(String(a.n), 10);
    const nb = parseInt(String(b.n), 10);
    const aOk = Number.isFinite(na);
    const bOk = Number.isFinite(nb);
    if (aOk && bOk && na !== nb) return na - nb;
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

export function getTopic(id: string | undefined) {
  return TOPICS.find((t) => t.id === id);
}

export function isReturnerOnly(article: Article) {
  return article.audience.includes("returner") && !article.audience.includes("beginner");
}

export function resolveTopic(slug: string, raw?: string | null): TopicId | null {
  if (raw === "planning" || raw === "transport" || raw === "camping" || raw === "onsite" || raw === "food") {
    return raw;
  }
  const fallback = PILLAR_BY_SLUG[slug] || null;
  if (!fallback) console.warn(`[frf] ${slug} has no topic pillar`);
  return fallback;
}

export function articleFromEntry(entry: {
  slug: string;
  data: {
    title: string;
    n?: string;
    meta?: string;
    audience?: string[];
    stage?: string;
    topics?: string[];
    pillar?: string;
    cover?: string;
  };
}): Article {
  return {
    slug: entry.slug,
    n: entry.data.n || "",
    title: entry.data.title,
    meta: entry.data.meta || "",
    audience: (entry.data.audience || []) as AudienceId[],
    stage: (entry.data.stage as StageId) || null,
    topic: resolveTopic(entry.slug, entry.data.pillar),
    topics: entry.data.topics || [],
    published: true,
    image: entry.data.cover,
  };
}

export function articlesByTopicFrom(list: Article[], id: TopicId) {
  // 老手專用篇只出現在 /upgrade，主題頁不重複。
  return sortByStageThenNumber(
    list.filter((a) => a.published && a.topic === id && !isReturnerOnly(a)),
  );
}

export function upgradeFrom(list: Article[]) {
  // 同時掛新手與老手的文章（目前為 tokyo-to-naeba）刻意不納入二衝頁。
  return sortByStageThenNumber(list.filter((a) => a.published && isReturnerOnly(a)));
}

export function relatedFrom(list: Article[], slug: string, limit = 3) {
  const current = list.find((a) => a.slug === slug);
  if (!current) return [];
  const others = (arr: Article[]) => arr.filter((a) => a.slug !== slug);
  if (isReturnerOnly(current)) return others(upgradeFrom(list)).slice(0, limit);
  if (!current.topic) return [];
  return others(articlesByTopicFrom(list, current.topic)).slice(0, limit);
}
