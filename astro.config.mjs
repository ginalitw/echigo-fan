import { defineConfig } from 'astro/config';

const SITE = 'https://echigo.fans';
const BASE = '/';

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

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    shikiConfig: { theme: 'github-light' },
    rehypePlugins: [rehypePrefixBase],
  },
});
