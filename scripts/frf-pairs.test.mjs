// npm test
// 新手篇／老手篇配對：同編號、一篇新手一篇老手。
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { pairOf, allPairs } from '../src/lib/frf-pairs.mjs';

const A = (slug, n, audience) => ({ slug, n, audience });

test('同編號、一新一老才配對', () => {
  const list = [A('b', '02', ['beginner']), A('r', '02', ['returner']), A('x', '03', ['beginner', 'returner']), A('c', '06', ['common'])];
  assert.deepEqual(pairOf(list, 'b'), { beginner: list[0], returner: list[1] });
  assert.deepEqual(pairOf(list, 'r'), { beginner: list[0], returner: list[1] });
  assert.equal(pairOf(list, 'x'), null, '新手老手都適用的不算');
  assert.equal(pairOf(list, 'c'), null);
  assert.equal(pairOf(list, 'nope'), null);
});

test('同號超過一篇新手就不猜', () => {
  const list = [A('b1', '02', ['beginner']), A('b2', '02', ['beginner']), A('r', '02', ['returner'])];
  assert.equal(pairOf(list, 'r'), null);
});

test('目前的文章：02、04、05 三組', () => {
  if (!fs.existsSync('src/content/frf')) return;
  const list = fs.readdirSync('src/content/frf').filter((f) => f.endsWith('.md')).map((f) => {
    const src = fs.readFileSync(`src/content/frf/${f}`, 'utf8');
    const n = (src.match(/^n:\s*"?(\d+)"?/m) || [])[1] || '';
    const audience = JSON.parse((src.match(/^audience:\s*(\[.*\])/m) || [])[1] || '[]');
    return A(f.replace(/\.md$/, ''), n, audience);
  });
  const pairs = allPairs(list).map((p) => `${p.beginner.slug}/${p.returner.slug}`);
  // 2026-10 的內容：這三組一定要配得到（之後 Notion 新增配對不會讓測試失敗）
  for (const want of ['budget-beginner/budget-comfort', 'camping-reality/hotels-and-inns', 'gear-beginner/gear-lightweight']) {
    const [b, r] = want.split('/');
    if (!list.some((a) => a.slug === b) || !list.some((a) => a.slug === r)) continue;
    assert.ok(pairs.includes(want), want);
  }
});
