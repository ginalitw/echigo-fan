// npm test
// 富士搖滾文章的「Q：」問答轉成 <details>：00 快速指引照舊，其他 FRF 攻略文也會轉，越後飯文章不動。
import assert from 'node:assert/strict';
import test from 'node:test';
import { rehypeFrfFaq, isQuestion } from '../src/lib/rehype-frf-faq.mjs';

const t = (value) => ({ type: 'text', value });
const p = (...children) => ({ type: 'element', tagName: 'p', properties: {}, children });
const strong = (value) => ({ type: 'element', tagName: 'strong', properties: {}, children: [t(value)] });
const h2 = (value) => ({ type: 'element', tagName: 'h2', properties: {}, children: [t(value)] });
const hr = () => ({ type: 'element', tagName: 'hr', properties: {}, children: [] });
const root = (...children) => ({ type: 'root', children });
const run = (tree, path) => { rehypeFrfFaq()(tree, { path, history: [path] }); return tree; };
const tags = (tree) => tree.children.map((n) => n.tagName);

const qaTree = () => root(
  h2('常見問題'),
  p(strong('Q：東京到苗場要多久？')),
  p(t('約 3 小時。')),
  p(strong('Q：接駁巴士多少錢？')),
  p(t('¥2,000。')),
  p(t('第二段答案。')),
  hr(),
  p(t('不屬於問答的段落')),
);

test('isQuestion：粗體或一般段落開頭是 Q：／Q: 才算', () => {
  assert.ok(isQuestion(p(strong('Q：要訂房嗎？'))));
  assert.ok(isQuestion(p(t('Q: half-width colon'))));
  assert.ok(!isQuestion(p(t('問：不是這個格式'))));
  assert.ok(!isQuestion(h2('Q：標題不算')));
});

test('00 快速指引：照舊轉成 details', () => {
  const tree = run(qaTree(), '/x/src/content/frf/beginner-faq.md');
  assert.deepEqual(tags(tree), ['h2', 'details', 'details', 'hr', 'p']);
});

test('其他 FRF 攻略文（例如 03 交通）也轉成 details，答案收到 hr 為止', () => {
  const tree = run(qaTree(), '/x/src/content/frf/tokyo-to-naeba.md');
  assert.deepEqual(tags(tree), ['h2', 'details', 'details', 'hr', 'p']);
  const second = tree.children[2];
  assert.equal(second.properties.className[0], 'frf-faq');
  assert.equal(second.children[0].tagName, 'summary');
  assert.equal(second.children[1].children.length, 2, '兩段答案都在同一題裡');
});

test('Windows 路徑也認得是 FRF 文章', () => {
  const tree = run(qaTree(), 'C:\\x\\src\\content\\frf\\hotels-and-inns.md');
  assert.ok(tags(tree).includes('details'));
});

test('越後飯一般文章不動', () => {
  const tree = run(qaTree(), '/x/src/content/posts/kiyotsu-gorge.md');
  assert.deepEqual(tags(tree), ['h2', 'p', 'p', 'p', 'p', 'p', 'hr', 'p']);
});

test('沒有 Q： 的 FRF 文章不動', () => {
  const tree = run(root(h2('交通'), p(t('一般段落')), hr()), '/x/src/content/frf/tokyo-to-naeba.md');
  assert.deepEqual(tags(tree), ['h2', 'p', 'hr']);
});
