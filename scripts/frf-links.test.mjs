// npm test
// 富士搖滾站內連結：連結文字一律顯示目標文章現在的標題，不帶「#02」這種編號。
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { frfLinkText, frfSlugOf, loadFrfTitles, rehypeFrfLinks, rewriteFrfLinksMd, displayTitle } from '../src/lib/frf-links.mjs';
import { renderFrf } from './frf-render-helper.mjs';

const titles = new Map([
  ['budget-beginner', '富士搖滾新手預算：門票住宿交通怎麼算'],
  ['gear-beginner', '裝備入門：菜鳥的生存與防禦'],
]);

test('displayTitle 拿掉「# 02」「#21」「＃ 08」', () => {
  assert.equal(displayTitle('# 02 老手預算：花在舒適的刀口上'), '老手預算：花在舒適的刀口上');
  assert.equal(displayTitle('#21 現場物販攻略'), '現場物販攻略');
  assert.equal(displayTitle('＃ 08 露營場地'), '露營場地');
});

test('frfSlugOf：只認文章網址，主題頁、外部連結不算', () => {
  assert.equal(frfSlugOf('/fujirock/budget-beginner/'), 'budget-beginner');
  assert.equal(frfSlugOf('/fujirock/budget-beginner'), 'budget-beginner');
  assert.equal(frfSlugOf('https://echigo.fans/fujirock/gear-beginner/'), 'gear-beginner');
  assert.equal(frfSlugOf('/fujirock/topic/planning/'), null);
  assert.equal(frfSlugOf('/fujirock/upgrade/'), null);
  assert.equal(frfSlugOf('/fujirock/'), null);
  assert.equal(frfSlugOf('/art-field/'), null);
  assert.equal(frfSlugOf('https://www.fujirockfestival.com/fujirock/x/'), null);
});

test('frfLinkText：換成目前標題；已經是目前標題就不動', () => {
  assert.equal(frfLinkText('/fujirock/budget-beginner/', '#02 新手預算：到底準備多少才夠？', titles), titles.get('budget-beginner'));
  assert.equal(frfLinkText('/fujirock/gear-beginner/', '# 05 裝備入門', titles), titles.get('gear-beginner'));
  assert.equal(frfLinkText('/fujirock/gear-beginner/', '新手篇', titles), titles.get('gear-beginner'));
  assert.equal(frfLinkText('/fujirock/budget-beginner/', titles.get('budget-beginner'), titles), null);
});

test('frfLinkText：錨點連結和還沒上線的文章，只拿掉編號', () => {
  assert.equal(frfLinkText('/fujirock/budget-beginner/#飲食', '#02 飲食那一段', titles), '飲食那一段');
  assert.equal(frfLinkText('/fujirock/budget-beginner/#飲食', '飲食那一段', titles), null);
  assert.equal(frfLinkText('/fujirock/naeba-stages/', '#14 舞台介紹', titles), '舞台介紹');
});

test('rehype：FRF 文章裡的站內連結換標題，外部連結與主題頁不動', async () => {
  const md = [
    '👉 詳見 [#02 新手預算：到底準備多少才夠？](/fujirock/budget-beginner/)',
    '',
    '[官網交通頁](https://www.fujirockfestival.com/access/index)',
    '',
    '[回預算與行前](/fujirock/topic/planning/)',
  ].join('\n');
  const { html } = await renderFrf(md, [[rehypeFrfLinks, { titles }]]);
  assert.match(html, /<a href="\/fujirock\/budget-beginner\/">富士搖滾新手預算：門票住宿交通怎麼算<\/a>/);
  assert.doesNotMatch(html, /#02/);
  assert.match(html, />官網交通頁</);
  assert.match(html, />回預算與行前</);
});

test('rehype：越後飯一般文章不動', async () => {
  const md = '[#02 新手預算](/fujirock/budget-beginner/)';
  const { html } = await renderFrf(md, [rehypeFrfLinks], '/x/src/content/posts/kiyotsu.md');
  assert.match(html, />#02 新手預算</);
});

test('rewriteFrfLinksMd：FAQPage 結構化資料用的 markdown 也一樣換', () => {
  const md = '答案。[#02 新手預算](/fujirock/budget-beginner/) 和 [Klook](https://www.klook.com/)';
  assert.equal(rewriteFrfLinksMd(md, titles), `答案。[${titles.get('budget-beginner')}](/fujirock/budget-beginner/) 和 [Klook](https://www.klook.com/)`);
});

test('loadFrfTitles：讀得到現有文章，標題都不帶編號', () => {
  const t = loadFrfTitles();
  if (!fs.existsSync('src/content/frf')) return;
  assert.ok(t.size >= 5);
  for (const [slug, title] of t) assert.doesNotMatch(title, /^[#＃]\s*\d/, slug);
});

test('目前所有 FRF 文章：網站上的站內連結文字不會再出現「#數字」', async () => {
  const t = loadFrfTitles();
  for (const f of fs.readdirSync('src/content/frf').filter((x) => x.endsWith('.md'))) {
    const md = fs.readFileSync(`src/content/frf/${f}`, 'utf8');
    const out = rewriteFrfLinksMd(md, t);
    const left = [...out.matchAll(/\[([^\]]+)\]\(((?:https:\/\/echigo\.fans)?\/fujirock\/[^)]*)\)/g)].filter((m) => /^\s*[#＃]\s*\d/.test(m[1]));
    assert.deepEqual(left.map((m) => m[0]), [], f);
  }
});
