// npm test
// 文章開頭的「本篇適合」「閱讀時間」改成標題下方的小標籤；空的「本篇適合」不顯示。
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { parseWho, parseRead, rehypeFrfWho } from '../src/lib/rehype-frf-who.mjs';
import { renderFrf } from './frf-render-helper.mjs';

test('parseWho：拆成身分標籤和說明', () => {
  assert.deepEqual(parseWho('🔰 新手首衝（預算有限、想用最低成本去一次音樂祭的人）'), { tags: ['🔰 新手首衝'], note: '預算有限、想用最低成本去一次音樂祭的人' });
  assert.deepEqual(parseWho('🔰 新手首衝 ／ 🌐 通用必修（第一次去、想快速找到答案的人）'), { tags: ['🔰 新手首衝', '🌐 通用必修'], note: '第一次去、想快速找到答案的人' });
  assert.deepEqual(parseWho('👑 老手升級 ｜ 去過至少一次，想優化住宿體驗'), { tags: ['👑 老手升級'], note: '去過至少一次，想優化住宿體驗' });
  assert.deepEqual(parseWho('🔰 新手首衝 ＋ 👑 老手升級'), { tags: ['🔰 新手首衝', '👑 老手升級'], note: '' });
});

test('parseWho：空的回 null（不顯示任何框）', () => {
  assert.equal(parseWho(''), null);
  assert.equal(parseWho('   '), null);
});

test('parseRead', () => {
  assert.equal(parseRead('約 6 分鐘'), '約 6 分鐘');
  assert.equal(parseRead('約10 分鐘'), '約 10 分鐘');
  assert.equal(parseRead('依需求跳讀，不需從頭到尾'), '依需求跳讀');
  assert.equal(parseRead(''), '');
});

const HEAD = (who) => [`> 👤 **本篇適合：**${who}`, '', '  **⏱ 閱讀時間：** 約 5 分鐘', '', '## 第一段', '', '內文。'].join('\n');

test('rehype：開頭的提示框和閱讀時間從內文拿掉，放進 frontmatter', async () => {
  const { html, frontmatter } = await renderFrf(HEAD(' 🔰 新手首衝（第一次去的人）'), [rehypeFrfWho]);
  assert.doesNotMatch(html, /本篇適合/);
  assert.doesNotMatch(html, /閱讀時間/);
  assert.match(html, /<h2>第一段<\/h2>/);
  assert.deepEqual(frontmatter.frfWho, { tags: ['🔰 新手首衝'], note: '第一次去的人' });
  assert.equal(frontmatter.frfRead, '約 5 分鐘');
});

test('rehype：「本篇適合：」是空的 → 框拿掉、沒有 frfWho', async () => {
  const { html, frontmatter } = await renderFrf(HEAD(''), [rehypeFrfWho]);
  assert.doesNotMatch(html, /blockquote/);
  assert.equal(frontmatter.frfWho, undefined);
  assert.equal(frontmatter.frfRead, '約 5 分鐘');
});

test('rehype：第一個標題之後的「本篇適合」不動', async () => {
  const md = ['## 第一段', '', '> 👤 **本篇適合：** 🔰 新手首衝'].join('\n');
  const { html } = await renderFrf(md, [rehypeFrfWho]);
  assert.match(html, /本篇適合/);
});

test('rehype：越後飯一般文章不動', async () => {
  const { html } = await renderFrf(HEAD(' 🔰 新手首衝'), [rehypeFrfWho], '/x/src/content/posts/a.md');
  assert.match(html, /本篇適合/);
});

test('文章頁樣板印出標籤，不再用內文判斷閱讀時間', () => {
  const src = fs.readFileSync('src/pages/fujirock/[slug].astro', 'utf8');
  assert.match(src, /frf-chip--who/);
  assert.match(src, /frf-who-note/);
  assert.match(src, /remarkPluginFrontmatter/);
  assert.match(src, /who\?\.note &&/, '說明是空的就不印');
});

test('目錄：寬度 1240px 以下預設收起，電腦版照舊', () => {
  const src = fs.readFileSync('src/pages/fujirock/[slug].astro', 'utf8');
  assert.match(src, /id="frf-toc" open/, '沒有 JavaScript 時維持展開');
  assert.match(src, /matchMedia\('\(min-width: 1240px\)'\)/);
  assert.match(src, /d\.open=false/);
});
