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
    desc: "斜坡、下雨、洗澡、帳篶跟住宿取捨。",
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
};

export const STAGES = [
  { id: "hesitate" as const, n: "01", title: "猶豫中", kicker: "去不去", desc: "Q&A、預算、露營值不值得。" },
  { id: "prep" as const, n: "02", title: "準備中", kicker: "要動手了", desc: "行前、交通、住、裝備。" },
  { id: "go" as const, n: "03", title: "出發前", kicker: "上山前最後看", desc: "打包、營地、洗澡、現場。" },
];

export const DOORS = [
  {
    id: "beginner" as const,
    title: "新手首衝",
    kicker: "第一次去",
    desc: "行前 / 交通 / 預算 / 裝備",
    image: "/images/frf/stage-rain.jpg",
  },
  {
    id: "returner" as const,
    title: "二衝升級",
    kicker: "去過了",
    desc: "免搭帳 / 指定席 / 露營分區",
    image: "/images/frf/red-marquee.jpg",
  },
];

export const ARTICLES: Article[] = [
  { slug: "beginner-faq", n: "00", title: "快速指引：新手 Q&A", meta: "門票怎麼買、要花多少、住哪、帶什麼。", audience: ["start"], stage: "hesitate", topic: "planning", topics: [], published: true },
  { slug: "before-you-go", n: "01", title: "行前準備：機票、住宿、岩盤門票", meta: "先機票再住宿再門票。", audience: ["start"], stage: "prep", topic: "planning", topics: [], published: true },
  { slug: "budget-beginner", n: "02", title: "新手預算", meta: "門票住宿交通怎麼算。", audience: ["beginner"], stage: "hesitate", topic: "planning", topics: [], published: true },
  { slug: "budget-comfort", n: "02", title: "老手預算：花在舒適的刀口上", meta: "免搭帳、接駁升級、住宿取捨。", audience: ["returner"], stage: "hesitate", topic: "planning", topics: [], published: true },
  { slug: "tokyo-to-naeba", n: "03", title: "東京到苗場交通", meta: "新幹線、接駁、行李。", audience: ["beginner", "returner"], stage: "prep", topic: "transport", topics: [], published: true },
  { slug: "camping-reality", n: "04", title: "露營真相", meta: "斜坡、下雨、洗澡。", audience: ["beginner"], stage: "hesitate", topic: "camping", topics: [], published: true },
  { slug: "hotels-and-inns", n: "04", title: "住宿進階：民宿與飯店", meta: "苗場與湯澤怎麼選。", audience: ["returner"], stage: "prep", topic: "camping", topics: [], published: true },
  { slug: "gear-beginner", n: "05", title: "裝備入門", meta: "雨衣、雨鞋、睡墊。", audience: ["beginner"], stage: "prep", topic: "camping", topics: [], published: true },
  { slug: "gear-lightweight", n: "05", title: "裝備進階：輕量化", meta: "三天行李減到能自己拉上山。", audience: ["returner"], stage: "prep", topic: "camping", topics: [], published: true },
  { slug: "daypack-packing", n: "06", title: "隨身背包", meta: "進場那個包要裝什麼。", audience: ["common"], stage: "go", topic: "camping", topics: [], published: true },
  { slug: "festival-chair", n: "07", title: "椅子挑選", meta: "重量、收納、現場限制。", audience: ["common"], stage: "prep", topic: "camping", topics: [], published: true },
  { slug: "campsite-map", n: "08", title: "露營場地", meta: "A 到 F 區、女子營。", audience: ["common"], stage: "go", topic: "camping", topics: [], published: true },
  { slug: "camping-shower", n: "09", title: "露營洗澡", meta: "免費淋浴、溫泉、錢湯。", audience: ["common"], stage: "go", topic: "camping", topics: [], published: true },
  { slug: "ueno-ameyoko", n: "10", title: "上野採購：阿美橫町", meta: "藥妝、電器、日用品。", audience: ["common"], stage: "prep", topic: "transport", topics: [], published: true },
  { slug: "echigo-yuzawa", n: "11", title: "越後湯澤", meta: "溫泉、伴手禮。", audience: ["common"], stage: "go", topic: "transport", topics: [], published: true },
  { slug: "eve-festival", n: "12", title: "前夜祭", meta: "週四入場、要不要提早一天。", audience: ["common"], stage: "go", topic: "food", topics: [], published: true },
  { slug: "naeba-food", n: "13", title: "苗場美食", meta: "哪幾攤值得排。", audience: ["common"], stage: "go", topic: "food", topics: [], published: true },
  { slug: "decathlon-gear", n: "16", title: "迪卡儲全套", meta: "帳篶防水、總價。", audience: ["common"], stage: "prep", topic: "camping", topics: [], published: true },
  { slug: "weather-defense", n: "17", title: "氣候防禦", meta: "防曬、防蟲、足部。", audience: ["common"], stage: "go", topic: "onsite", topics: [], published: true },
  { slug: "timetable-strategy", n: "18", title: "演出排程", meta: "舞台距離、撞場、體力。", audience: ["common"], stage: "go", topic: "onsite", topics: [], published: true },
  { slug: "wristband", n: "19", title: "入場手環", meta: "換票、配戴、露營要先換。", audience: ["common"], stage: "go", topic: "onsite", topics: [], published: true },
  { slug: "power-and-signal", n: "20", title: "充電與通訊", meta: "行動電源、離線地圖。", audience: ["common"], stage: "prep", topic: "onsite", topics: [], published: true },
  { slug: "merch-queue", n: "21", title: "現場物販", meta: "幾點開賣、前夜祭限制。", audience: ["common"], stage: "go", topic: "onsite", topics: [], published: true },
];

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
    if (!bOk && aOk) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

export function sortByNumber(list: Article[]) {
  return sortByStageThenNumber(list);
}

export function getTopic(id: string | undefined) {
  return TOPICS.find((t) => t.id === id);
}

export function getDoor(id: string | undefined) {
  return DOORS.find((d) => d.id === id);
}

export function resolveTopic(slug: string, raw?: string | null): TopicId | null {
  if (raw === "planning" || raw === "transport" || raw === "camping" || raw === "onsite" || raw === "food") {
    return raw;
  }
  return PILLAR_BY_SLUG[slug] || null;
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
  return sortByStageThenNumber(list.filter((a) => a.published && a.topic === id));
}

export function upgradeFrom(list: Article[]) {
  return sortByStageThenNumber(
    list.filter(
      (a) => a.published && a.audience.includes("returner") && !a.audience.includes("beginner"),
    ),
  );
}

export function relatedFrom(list: Article[], slug: string, limit = 3) {
  const current = list.find((a) => a.slug === slug);
  if (!current?.topic) return [];
  return articlesByTopicFrom(list, current.topic).filter((a) => a.slug !== slug).slice(0, limit);
}

export function articlesByAudienceFrom(list: Article[], id: AudienceId) {
  return sortByStageThenNumber(
    list.filter(
      (a) => a.published && (a.audience.includes(id) || a.audience.includes("common") || a.audience.includes("start")),
    ),
  );
}
