export type StageId = "hesitate" | "prep" | "go";
export type AudienceId = "beginner" | "returner" | "common" | "start";

export type Article = {
  slug: string;
  n: string;
  title: string;
  meta: string;
  audience: AudienceId[];
  stage: StageId | null;
  topics: string[];
  published: boolean;
  image?: string;
};

export const STAGES: {
  id: StageId;
  n: string;
  title: string;
  kicker: string;
  desc: string;
}[] = [
  { id: "hesitate", n: "01", title: "猶豫中", kicker: "去不去", desc: "Q&A、預算、露營值不值得。" },
  { id: "prep", n: "02", title: "準備中", kicker: "要動手了", desc: "行前、交通、住、裝備。" },
  { id: "go", n: "03", title: "出發前", kicker: "上山前最後看", desc: "打包、營地、洗澡、現場。" },
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

export const FEATURED = [
  { slug: "tokyo-to-naeba", title: "東京到苗場怎麼去", desc: "新幹線、接駁、行李" },
  { slug: "camping-reality", title: "富士搖滾露營真相", desc: "斜坡、下雨、洗澡排隊" },
  { slug: "budget-beginner", title: "第一次去要多少錢", desc: "門票、食宿、交通實估" },
  { slug: "gear-beginner", title: "天氣、穿搭與裝備", desc: "雨衣、雨鞋、山上天氣" },
];

/** 預覽用報名卡。正式站改這幾個欄位即可，不必新開 Notion 庫。 */
export const SIGNUP = {
  title: "2027富搖包棟計劃敬請期待",
  window: "",
  note: "",
  url: "",
};

export const ARTICLES: Article[] = [
  { slug: "beginner-faq", n: "00", title: "快速指引：新手 Q&A", meta: "門票怎麼買、要花多少、住哪、帶什麼。一頁看完再決定。", audience: ["start"], stage: "hesitate", topics: ["預算", "裝備", "住宿", "交通"], published: true },
  { slug: "before-you-go", n: "01", title: "富士搖滾行前準備：機票、住宿、岩盤門票", meta: "富士搖滾行前準備：先機票再住宿再門票、七月怎麼買機票、岩盤怎麼用。台灣人版本時間軸。", audience: ["start"], stage: "prep", topics: ["住宿", "裝備"], published: true, image: "/images/frf/before-you-go.jpg" },
  { slug: "budget-beginner", n: "02", title: "富士搖滾新手預算：門票住宿交通怎麼算", meta: "第一次去富士搖滾要準備多少錢？門票、住宿、交通、現場開銷全部拆開算，含台幣試算。", audience: ["beginner"], stage: "hesitate", topics: ["預算"], published: true },
  { slug: "budget-comfort", n: "02", title: "老手預算：花在舒適的刀口上", meta: "免搭帳、接駁升級、住宿取捨。", audience: ["returner"], stage: "hesitate", topics: ["預算"], published: true },
  { slug: "tokyo-to-naeba", n: "03", title: "東京到苗場交通：新幹線、接駁與行李", meta: "東京到苗場怎麼去：上野搭上越新幹線到越後湯澤，再轉接駁車。含班次、時間、行李寄放與備案。", audience: ["beginner", "returner"], stage: "prep", topics: ["交通"], published: true, image: "/images/frf/street.jpg" },
  { slug: "camping-reality", n: "04", title: "富士搖滾露營：斜坡、下雨、洗澡真相", meta: "富士搖滾露營的真相：90% 是斜坡、午後必下雨、洗澡要排一小時。決定露營前先看這篇。", audience: ["beginner"], stage: "hesitate", topics: ["住宿", "露營", "預算"], published: true, image: "/images/frf/stage-rain.jpg" },
  { slug: "hotels-and-inns", n: "04", title: "住宿進階：民宿與飯店", meta: "苗場與湯澤怎麼選、要訂多早。", audience: ["returner"], stage: "prep", topics: ["住宿"], published: true, image: "/images/frf/hotel.jpg" },
  { slug: "gear-beginner", n: "05", title: "裝備入門：生存與防禦", meta: "雨衣、雨鞋、睡墊、耳塞。", audience: ["beginner"], stage: "prep", topics: ["裝備"], published: true },
  { slug: "gear-lightweight", n: "05", title: "裝備進階：輕量化", meta: "三天行李減到能自己拉上山。", audience: ["returner"], stage: "prep", topics: ["裝備"], published: true },
  { slug: "daypack-packing", n: "06", title: "隨身背包：生存打包術", meta: "進場那個包要裝什麼。", audience: ["common"], stage: "go", topics: ["裝備"], published: true },
  { slug: "festival-chair", n: "07", title: "椅子挑選", meta: "重量、收納、現場限制。", audience: ["common"], stage: "prep", topics: ["裝備"], published: true },
  { slug: "campsite-map", n: "08", title: "露營場地：滑雪場的瘋狂", meta: "A 到 F 區、女子營、平地怎麼搶。", audience: ["common"], stage: "go", topics: ["露營"], published: true },
  { slug: "camping-shower", n: "09", title: "露營洗澡", meta: "免費淋浴、溫泉、錢湯。", audience: ["common"], stage: "go", topics: ["露營"], published: true },
  { slug: "ueno-ameyoko", n: "10", title: "上野採購：阿美橫町", meta: "藥妝、電器、日用品，比現場便宜。", audience: ["common"], stage: "prep", topics: ["裝備"], published: true },
  { slug: "echigo-yuzawa", n: "11", title: "越後湯澤：回程前", meta: "ぽんしゅ館、溫泉、伴手禮。", audience: ["common"], stage: "go", topics: [], published: true },
  { slug: "eve-festival", n: "12", title: "前夜祭", meta: "週四入場時間、要不要提早一天。", audience: ["common"], stage: "go", topics: [], published: true, image: "/images/frf/neon.jpg" },
  { slug: "naeba-food", n: "13", title: "苗場美食", meta: "歷年問卷，哪幾攤值得排。", audience: ["common"], stage: "go", topics: [], published: true },
  { slug: "naeba-stages", n: "14", title: "苗場舞台", meta: "綠白紅田園日出，步行時間。", audience: ["common"], stage: "go", topics: [], published: true, image: "/images/frf/red-marquee.jpg" },
  { slug: "decathlon-gear", n: "16", title: "迪卡儲全套", meta: "帳篶防水係數、總價。", audience: ["common"], stage: "prep", topics: ["裝備", "露營"], published: true },
  { slug: "weather-defense", n: "17", title: "氣候防禦", meta: "防曬、防蟲、足部救護。", audience: ["common"], stage: "go", topics: ["裝備", "露營"], published: true },
  { slug: "timetable-strategy", n: "18", title: "演出排程", meta: "舞台距離、撞場、體力。", audience: ["common"], stage: "go", topics: [], published: true },
  { slug: "power-and-signal", n: "20", title: "充電與通訊", meta: "行動電源、入境 Wh、離線地圖。", audience: ["common"], stage: "prep", topics: [], published: true },
];

export function displayTitle(title: string) {
  return title.replace(/^#\s*\d+\s*/, "").trim();
}

export function articlesByStage(id: StageId) {
  return ARTICLES.filter((a) => a.published && a.stage === id);
}

export function articlesByAudience(id: AudienceId) {
  return ARTICLES.filter((a) => a.published && (a.audience.includes(id) || a.audience.includes("common") || a.audience.includes("start")));
}

export function getArticle(slug: string | undefined) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getStage(id: string | undefined) {
  return STAGES.find((s) => s.id === id);
}

export function getDoor(id: string | undefined) {
  return DOORS.find((d) => d.id === id);
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
    topics: entry.data.topics || [],
    published: true,
    image: entry.data.cover,
  };
}

export function articlesByAudienceFrom(list: Article[], id: AudienceId) {
  return list.filter(
    (a) => a.published && (a.audience.includes(id) || a.audience.includes("common") || a.audience.includes("start")),
  );
}
