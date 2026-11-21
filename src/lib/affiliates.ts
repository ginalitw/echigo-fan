// 合作連結：只放富士搖滾攻略文，一篇最多兩格。
//   top：「速覽」框下面；end：文末、上下篇導覽之前。不插在段落中間。
// kind 'affiliate' = 聯盟連結（標「合作連結」、rel=sponsored）
// kind 'own'       = 越後飯自家企劃（2027/2 底櫻雪包棟計畫開賣時，把預留格換成這個）
// href 尚未申請聯盟帳號前用 '#'，正式上線前換成帶追蹤碼的連結。
export type AffSlot = {
  kind: 'affiliate' | 'own';
  vendor: string;      // 平台名（純文字，不放對方 logo）
  title: string;       // 一句話說這是什麼
  note: string;        // 為什麼放在這篇
  cta: string;         // 按鈕字
  href: string;
};
export type AffConfig = { top?: AffSlot; end?: AffSlot };

export const AFF_LABEL = { affiliate: '合作連結', own: '越後飯企劃' } as const;

export const AFF_DISCLOSURE =
  '透過合作連結預訂，越後飯會得到小額回饋，你付的價格不變。';

// 預留格：2027/2 底前先放聯盟連結；開賣時把這格整個換掉。
export const RESERVED_OWN: AffSlot = {
  kind: 'own',
  vendor: '櫻雪旅行社 × 越後飯',
  title: '苗場包棟住宿計畫',
  note: '2027 年 2 月底開放報名（示意）',
  cta: '看計畫內容',
  href: '#',
};

export const AFF_BY_SLUG: Record<string, AffConfig> = {
  'tokyo-to-naeba': {
    top: { kind: 'affiliate', vendor: 'Klook', title: 'Skyliner 車票（成田→上野）', note: '下飛機第一段，先買好少排一次隊', cta: '看票價', href: '#' },
    end: { kind: 'affiliate', vendor: 'Klook', title: 'JR 東日本鐵路周遊券', note: '東京—越後湯澤來回再加其他行程才划算，先算過再買', cta: '看票價', href: '#' },
  },
  'hotels-and-inns': {
    top: { kind: 'affiliate', vendor: 'Agoda', title: '越後湯澤站周邊住宿', note: '苗場訂不到時的備案，接駁巴士單程約 40 分', cta: '看空房', href: '#' },
    end: { kind: 'affiliate', vendor: 'Agoda', title: '越後湯澤站周邊住宿', note: '預留格：2027/2 底換成包棟計畫報名', cta: '看空房', href: '#' },
  },
  'power-and-signal': {
    top: { kind: 'affiliate', vendor: 'Klook', title: '日本 eSIM', note: '營區沒插座，手機省電從網路設定開始', cta: '看方案', href: '#' },
  },
  'ueno-ameyoko': {
    top: { kind: 'affiliate', vendor: 'Klook', title: 'Skyliner 車票（成田→上野）', note: '從機場直接到上野，採購完再出發', cta: '看票價', href: '#' },
    end: { kind: 'affiliate', vendor: 'Agoda', title: '上野站周邊住宿', note: '前一晚住上野，隔天新幹線不用趕', cta: '看空房', href: '#' },
  },
  'before-you-go': {
    end: { kind: 'affiliate', vendor: 'Agoda', title: '越後湯澤站周邊住宿', note: '機票訂好就先卡住宿，多數可免費取消', cta: '看空房', href: '#' },
  },
};
