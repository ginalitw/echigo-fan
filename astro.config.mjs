import { defineConfig } from 'astro/config';

const SITE = 'https://echigo.fans';
const BASE = '/';

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  return (node.children || []).map(textOf).join('');
}

function setText(node, value) {
  node.children = [{ type: 'text', value }];
}

function isHeading(node) {
  return node?.type === 'element' && /^h[1-6]$/.test(node.tagName);
}

function stripDecor(s) {
  return String(s)
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u20E3\s]+/u, '')
    .trim();
}

function rehypePrefixBase() {
  const prefix = BASE === '/' ? '' : BASE.replace(/\/$/, '');
  return (tree) => {
    if (!prefix) return;
    const walk = (node) => {
      if (node.type === 'element' && node.properties) {
        for (const attr of ['src', 'href']) {
          const v = node.properties[attr];
          if (
            typeof v === 'string' &&
            v.startsWith('/') &&
            !v.startsWith('//') &&
            !v.startsWith(`${prefix}/`)
          ) {
            node.properties[attr] = prefix + v;
          }
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}

function rehypeFixBoldStars() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'text' && node.value) {
        node.value = node.value
          .replace(/\*\*\*\*/g, '')
          .replace(/\*\*(\S(?:[\s\S]*?\S)?)\s+\*\*/g, '$1')
          .replace(/\*\*(\S(?:[\s\S]*?\S)?)\*\*/g, '$1');
      }
      if (node.type === 'element' && node.tagName === 'strong') {
        for (const child of node.children || []) {
          if (child.type === 'text' && child.value) {
            child.value = child.value.replace(/\*+/g, '');
          }
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}

function isFaqDoc(tree, file) {
  const path = String(file?.path || file?.history?.join(' ') || '');
  if (path.includes('beginner-faq')) return true;
  const headings = (tree.children || [])
    .filter(isHeading)
    .map((n) => stripDecor(textOf(n)));
  return headings.some((t) => t.includes('目錄指引')) && headings.some((t) => t.includes('預算') && t.includes('交通'));
}

function isQuestion(node) {
  if (node?.type !== 'element' || node.tagName !== 'p') return false;
  return /^Q[:：]/.test(textOf(node).replace(/\s+/g, ' ').trim());
}

function rehypeFrfFaq() {
  return (tree, file) => {
    if (!isFaqDoc(tree, file)) return;
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

function rehypeFrfArticle() {
  return (tree) => {
    const children = tree.children || [];
    for (const node of children) {
      if (isHeading(node)) {
        const cleaned = stripDecor(textOf(node));
        if (cleaned) setText(node, cleaned);
      }
    }

    const splice = (startTest, headingOnly, stopExtra, keep) => {
      const out = [];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const hit = headingOnly
          ? isHeading(node) && startTest(textOf(node))
          : node?.type === 'element' && startTest(textOf(node));
        if (hit) {
          const group = [node];
          let j = i + 1;
          while (j < children.length) {
            const n = children[j];
            if (isHeading(n)) break;
            if (stopExtra && stopExtra(n)) break;
            group.push(n);
            j++;
          }
          if (keep) {
            out.push({
              type: 'element',
              tagName: 'aside',
              properties: { className: [keep] },
              children: group,
            });
          }
          i = j - 1;
        } else {
          out.push(node);
        }
      }
      children.length = 0;
      children.push(...out);
    };

    splice((t) => t.includes('懶人重點'), true, null, 'frf-takeaway');
    splice(
      (t) => t.includes('延伸閱讀'),
      true,
      (n) => n.type === 'element' && (n.tagName === 'hr' || n.tagName === 'blockquote'),
      null,
    );
    splice(
      (t) => t.includes('還有問題') || t.includes('加入我們的社群'),
      false,
      (n) => n.type === 'element' && n.tagName === 'hr',
      'frf-signoff',
    );
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypePrefixBase, rehypeFixBoldStars, rehypeFrfFaq, rehypeFrfArticle],
  },
});
