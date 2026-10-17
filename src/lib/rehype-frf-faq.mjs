// 富士搖滾文章的「Q：」問答，轉成可收合的 <details>。
//
// Notion 的切換清單（toggle）同步成 Markdown 後長這樣：
//   **Q：問題**
//   （空行）
//     答案段落
//
// 以前只有 00 快速指引那篇會轉；現在所有 src/content/frf/ 的文章都會轉，
// 讓 02、03、04 這類攻略文也能在文末放 Q&A，外觀跟 00 一致。
// 結構化資料（FAQPage）由 src/lib/faq.ts 從同一份原文抓，不在這裡處理。
// 越後飯的一般文章不動。

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  return (node.children || []).map(textOf).join('');
}

function isHeading(node) {
  return node?.type === 'element' && /^h[1-6]$/.test(node.tagName);
}

function stripDecor(s) {
  return String(s)
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u20E3\s]+/u, '')
    .trim();
}

function pathOf(file) {
  return String(file?.path || file?.history?.join(' ') || '').replace(/\\/g, '/');
}

export function isFaqDoc(tree, file) {
  const path = pathOf(file);
  if (path.includes('beginner-faq')) return true;
  const headings = (tree.children || [])
    .filter(isHeading)
    .map((n) => stripDecor(textOf(n)));
  return headings.some((t) => t.includes('目錄指引')) && headings.some((t) => t.includes('預算') && t.includes('交通'));
}

export function isFrfArticle(file) {
  return pathOf(file).includes('/content/frf/');
}

export function isQuestion(node) {
  if (node?.type !== 'element' || node.tagName !== 'p') return false;
  return /^Q[:：]/.test(textOf(node).replace(/\s+/g, ' ').trim());
}

export function rehypeFrfFaq() {
  return (tree, file) => {
    if (!isFaqDoc(tree, file) && !isFrfArticle(file)) return;
    const children = tree.children || [];
    const out = [];
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (!isQuestion(node)) {
        out.push(node);
        continue;
      }
      const body = [];
      let j = i + 1;
      while (j < children.length) {
        const n = children[j];
        if (isQuestion(n) || isHeading(n)) break;
        if (n?.type === 'element' && n.tagName === 'hr') break;
        body.push(n);
        j++;
      }
      out.push({
        type: 'element',
        tagName: 'details',
        properties: { className: ['frf-faq'] },
        children: [
          {
            type: 'element',
            tagName: 'summary',
            properties: {},
            children: node.children || [],
          },
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['frf-faq-body'] },
            children: body,
          },
        ],
      });
      i = j - 1;
    }
    children.length = 0;
    children.push(...out);
  };
}
