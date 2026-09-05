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

function rehypeFrfArticle() {
  return (tree) => {
    const children = tree.children || [];
    for (const node of children) {
      if (isHeading(node)) {
        const cleaned = stripDecor(textOf(node));
        if (cleaned) setText(node, cleaned);
      }
    }

    const wrap = (startTest, className, stopExtra, headingOnly = true) => {
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
          out.push({
            type: 'element',
            tagName: 'aside',
            properties: { className: [className] },
            children: group,
          });
          i = j - 1;
        } else {
          out.push(node);
        }
      }
      children.length = 0;
      children.push(...out);
    };

    wrap((t) => t.includes('懶人重點'), 'frf-takeaway');
    wrap(
      (t) => t.includes('延伸閱讀'),
      'frf-related',
      (n) => n.type === 'element' && (n.tagName === 'hr' || n.tagName === 'blockquote'),
    );
    wrap(
      (t) => t.includes('還有問題') || t.includes('加入我們的社群'),
      'frf-signoff',
      (n) => n.type === 'element' && n.tagName === 'hr',
      false,
    );

    for (const node of children) {
      if (node.type !== 'element' || ![].concat(node.properties?.className || []).includes('frf-related')) continue;
      node.children = (node.children || []).filter((child) => {
        if (child.type === 'element' && child.tagName === 'p' && /想繼續深入/.test(textOf(child))) {
          return false;
        }
        return true;
      });
      const tidy = (n) => {
        if (n.type === 'element' && n.tagName === 'a') {
          const t = textOf(n)
            .replace(/^[\p{Extended_Pictographic}\uFE0F\u20E3\s]+/u, '')
            .replace(/^#\s*\d+\s*/, '')
            .trim();
          if (t) setText(n, t);
        }
        for (const c of n.children || []) tidy(c);
      };
      tidy(node);
    }
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypePrefixBase, rehypeFrfArticle],
  },
});
