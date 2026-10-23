// 聯盟連結：依文章 slug 決定要不要出現推薦框。
// 只放讀者要做決定的文章（交通、住宿、票券），一篇最多兩個連結。
// url 尚未申請聯盟帳號前用 '#'，preview 標示「示意」；正式上線前換成真連結。
export type AffiliateLink = { label: string; note: string; href: string; vendor: string };
export type AffiliateBox = { title: string; intro?: string; links: AffiliateLink[] };

export const AFFILIATE_BY_SLUG: Record<string, AffiliateBox> = {
  'hotels-and-inns': {
    title: '訂不到苗場時，我會這樣找越後湯澤的房',
    links: [
      { vendor: '樂天旅遊', label: '越後湯澤站周邊住宿', note: '日本在地房源多，可篩「步行到車站」', href: '#' },
      { vendor: 'Booking.com', label: '越後湯澤飯店比價', note: '多數可免費取消，適合先卡位', href: '#' },
    ],
  },
  'tokyo-to-naeba': {
    title: '新幹線票我會這樣買',
    links: [
      { vendor: 'Klook', label: 'JR 東日本鐵路周遊券', note: '來回東京—越後湯澤加上其他行程才划算，先算過再買', href: '#' },
    ],
  },
};

export const AFFILIATE_DISCLOSURE = '透過這些連結預訂，越後飯會得到小額回饋，你付的價格不變。只放我自己用過或會用的。';
