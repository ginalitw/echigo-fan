// 測試用：把 markdown 用跟網站一樣的 remark／rehype 流程轉成 HTML（只掛 FRF 版面相關的外掛）。
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { VFile } from 'vfile';

export async function renderFrf(markdown, plugins, path = '/x/src/content/frf/demo.md') {
  const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
  const file = new VFile({ path, value: body, data: { astro: { frontmatter: {} } } });
  let p = unified().use(remarkParse).use(remarkGfm).use(remarkRehype);
  for (const pl of plugins) p = Array.isArray(pl) ? p.use(...pl) : p.use(pl);
  const out = await p.use(rehypeStringify).process(file);
  return { html: String(out), frontmatter: file.data.astro.frontmatter };
}
