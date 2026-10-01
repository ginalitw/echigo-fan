// 中文標題的斷行：只允許在標點後、空白處、中英文交界斷開。
// 搭配 CSS 的 word-break: keep-all，手機上就不會出現「里山現／代美術館」這種切法。
// 整段都沒有斷點又太長時，overflow-wrap: anywhere 會兜底，不會撐破版面。
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function phrase(text?: string | null): string {
  if (!text) return '';
  return esc(text)
    .replace(/([，、：；。！？」』）】》｜])/g, '$1<wbr>')
    .replace(/([「『（【《])/g, '<wbr>$1')
    .replace(/([㐀-鿿぀-ヿ])(?=[A-Za-z0-9])/g, '$1<wbr>')
    .replace(/([A-Za-z0-9])(?=[㐀-鿿぀-ヿ])/g, '$1<wbr>');
}
