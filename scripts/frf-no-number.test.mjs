// 文章編號（Notion 標題前綴「# 02」）只拿來排序，網站上不顯示。
// 新手篇和老手篇是同一號的兩欄，編號顯示出來會像重複，所以頁面樣板不能再把 n 印出來。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const PAGES = [
  'src/pages/fujirock/[slug].astro',
  'src/pages/fujirock/topic/[id].astro',
  'src/pages/fujirock/index.astro',
  'src/pages/fujirock/upgrade.astro',
];

for (const p of PAGES) {
  test(`${p} 不顯示文章編號`, () => {
    const src = fs.readFileSync(p, 'utf8');
    const html = src.split(/^---$/m).slice(2).join('---');
    assert.doesNotMatch(html, /\b(article|a|prevA|nextA)\.n\b/, '樣板裡不應該用到文章的 n');
    assert.doesNotMatch(html, /No\.\{/, '不應該再有 No.{編號}');
  });
}
