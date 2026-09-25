// 從 00 快速指引那篇的原始 markdown 抓出 Q/A 配對，輸出 FAQPage 結構化資料。
//
// 只吃這個格式：
//   **Q：問題**
//   （空行）
//     答案段落
//
// 抓不到就回 null，不會硬湊。頁面上看不到的內容不可以進 FAQPage，
// 所以這裡只取原文既有的文字，不自己生成。

const Q_LINE = /^\s*\*\*\s*Q[：:]\s*(.+?)\s*\*\*\s*$/;

export type QA = { question: string; answer: string };

export function extractFaq(markdown: string, limit = 30): QA[] {
  const lines = markdown.split('\n');
  const out: QA[] = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(Q_LINE);
    if (!m) continue;

    const question = clean(m[1]);
    const parts: string[] = [];

    for (let j = i + 1; j < lines.length; j++) {
      const raw = lines[j];
      if (Q_LINE.test(raw)) break;        // 下一題
      if (/^#{1,6}\s/.test(raw)) break;   // 換段落大標
      const t = raw.trim();
      if (!t) {
        if (parts.length) break;          // 答案結束在第一個空行
        continue;                         // Q 和答案中間的空行
      }
      if (t.startsWith('👉')) break;      // 「詳見」那行不算答案
      parts.push(t);
    }

    const answer = clean(parts.join(' '));
    if (question && answer.length >= 10) out.push({ question, answer });
    if (out.length >= limit) break;
  }

  return out;
}

/** 去掉 markdown 連結語法與強調符號，只留純文字。 */
function clean(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function faqLd(qas: QA[]) {
  if (qas.length === 0) return null;
  return {
    '@type': 'FAQPage',
    inLanguage: 'zh-Hant',
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}
