// npm test
// Notion 表格寫的三種元件：💰 預算總覽卡、🧭 決策卡、🕒 時間軸；四欄以上的一般表格手機改卡片。
// 寫法見 docs/frf-rewrite/components.md，示範內容在 scripts/fixtures/frf-components-demo.md。
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { rehypeFrfComponents, componentKind, MARKERS, STACK_MAX_ROWS } from '../src/lib/rehype-frf-components.mjs';
import { renderFrf } from './frf-render-helper.mjs';

const DEMO = fs.readFileSync('scripts/fixtures/frf-components-demo.md', 'utf8');
const render = (md, path) => renderFrf(md, [rehypeFrfComponents], path);
const count = (html, re) => (html.match(re) || []).length;

test('記號：第一列第一格開頭', () => {
  assert.match('💰 預算總覽：露營最省玩法', MARKERS.cost);
  assert.match('💰預算總覽', MARKERS.cost);
  assert.match('🧭 如果你：最後一晚想怎麼走？', MARKERS.choice);
  assert.match('🕒 時間軸：抵達日', MARKERS.timeline);
  assert.doesNotMatch('預算總覽', MARKERS.cost, '沒有 emoji 不算');
  assert.doesNotMatch('💰 日圓（2026）', MARKERS.cost, '只有 emoji 不算');
});

test('示範頁：三種元件都轉出來，表格只剩一張（一般寬表格）', async () => {
  const { html } = await render(DEMO);
  assert.equal(count(html, /<aside class="frf-cost"/g), 1);
  assert.equal(count(html, /<section class="frf-choice"/g), 1);
  assert.equal(count(html, /<section class="frf-timeline"/g), 1);
  assert.equal(count(html, /<table/g), 1);
  assert.match(html, /<table class="frf-table--stack">/);
});

test('預算總覽卡：總計放最上面、小計、還沒算進去、來源', async () => {
  const { html } = await render(DEMO);
  const card = html.slice(html.indexOf('<aside class="frf-cost"'), html.indexOf('</aside>') + 8);
  assert.match(card, /<p class="frf-cost-label">預算總覽・露營最省玩法<\/p>/);
  assert.match(card, /<p class="frf-cost-total">約 ¥96,000～104,000<\/p>/);
  assert.ok(card.indexOf('frf-cost-total') < card.indexOf('三日券'), '總計在明細前面');
  assert.match(card, /<li class="frf-cost-sum"><span class="frf-cost-k">固定開銷小計<\/span><span class="frf-cost-v">約 ¥84,000<\/span><\/li>/);
  assert.match(card, /<span class="frf-cost-k">三日券<small>先行價 ¥57,000＋海外購票手續費 10%<\/small><\/span><span class="frf-cost-v">¥62,700<\/span>/);
  assert.match(card, /<p class="frf-cost-out"><strong>還沒算進去：<\/strong>機票/);
  assert.match(card, /<p class="frf-cost-src">來源：<a href="https:\/\/www\.fujirockfestival\.com\/ticket\/index">官網票價頁<\/a>（2026）/);
  assert.doesNotMatch(card, /總計/, '「總計」兩個字本身不印');
});

test('決策卡：每列一張，⚠️ 變紅色，空格不印', async () => {
  const { html } = await render(DEMO);
  assert.match(html, /<p class="frf-choice-q">最後一晚想怎麼走？<\/p>/);
  assert.equal(count(html, /<li class="frf-choice-card/g), 3);
  assert.equal(count(html, /frf-choice-card is-warn/g), 1);
  assert.match(html, /<p class="frf-choice-if">如果你：當天一定要回東京<\/p>/);
  assert.doesNotMatch(html, /如果你：⚠/);
  assert.match(html, /<p class="frf-choice-do">比壓軸提早 1\.5～2 小時離場下山<\/p>/);
  assert.match(html, /<dt>來源<\/dt><dd><a href="https:\/\/ganban\.net\/\?p=78374">岩盤 OPTIONAL SERVICES<\/a>（2026）<\/dd>/);
  const first = html.slice(html.indexOf('is-warn'), html.indexOf('</li>', html.indexOf('is-warn')));
  assert.doesNotMatch(first, /<dt>來源<\/dt>/, '第一列來源是空的，不印');
});

test('時間軸：每列一站，時間／費用變小標籤，注意欄是說明、⚠️ 變紅', async () => {
  const { html } = await render(DEMO);
  assert.match(html, /<p class="frf-timeline-title">抵達日從成田到苗場<\/p>/);
  assert.equal(count(html, /<li class="frf-tl-step">/g), 4);
  assert.match(html, /<p class="frf-tl-stop">成田機場<\/p><div class="frf-tl-body"><p class="frf-tl-do">搭 Skyliner 直達上野<\/p><ul class="frf-tl-meta"><li><span class="frf-tl-k">時間<\/span> 41 分鐘<\/li><li><span class="frf-tl-k">費用<\/span> ¥2,580<\/li><\/ul>/);
  assert.match(html, /<p class="frf-tl-note is-warn">前夜祭當天（週四）12:00 才開始發車<\/p>/);
  assert.match(html, /<p class="frf-tl-stop">苗場會場<\/p><div class="frf-tl-body"><p class="frf-tl-note">在王子飯店前/);
});

test('一般寬表格：四欄以上加 data-label；三欄以下、太長的表格不動', async () => {
  const wide = '| 住宿 | 到會場 | 訂房 | 適合 |\n| --- | --- | --- | --- |\n| 民宿 | 30 分 | 5 月 | 想睡室內 |';
  const { html } = await render(wide);
  assert.match(html, /<table class="frf-table--stack">/);
  assert.match(html, /<td data-label="到會場"><span class="frf-cell">30 分<\/span><\/td>/);
  const mixed = '| 裝備 | 品牌 | 預算 | 價值 |\n| --- | --- | --- | --- |\n| 外層 | **Gore-Tex 外套** (TNF) |  | 透氣 |';
  const m = (await render(mixed)).html;
  assert.match(m, /<span class="frf-cell"><strong>Gore-Tex 外套<\/strong> \(TNF\)<\/span>/, '粗體和一般字包在同一格');
  assert.match(m, /<td data-label="預算" class="is-empty"><\/td>/, '空格標成 is-empty，手機上不顯示');
  const narrow = '| 項目 | 金額 | 備註 |\n| --- | --- | --- |\n| 三日券 | ¥62,700 | 先行價 |';
  assert.doesNotMatch((await render(narrow)).html, /frf-table--stack/);
  const rows = Array.from({ length: STACK_MAX_ROWS + 1 }, (_, i) => `| ${i} | a | b | c |`).join('\n');
  assert.doesNotMatch((await render(`| a | b | c | d |\n| --- | --- | --- | --- |\n${rows}`)).html, /frf-table--stack/);
});

test('沒有記號的表格不會被當成元件', async () => {
  const md = '| **項目** | **日圓（2026）** | **備註** |\n| --- | --- | --- |\n| 🏁 **日本當地小計** | 約 ¥96,000 | 不含機票 |';
  const { html } = await render(md);
  assert.match(html, /<table>/);
  assert.doesNotMatch(html, /frf-cost/);
});

test('越後飯一般文章不動', async () => {
  const { html } = await render(DEMO, '/x/src/content/posts/a.md');
  assert.equal(count(html, /<table/g), 4);
  assert.doesNotMatch(html, /frf-cost|frf-choice|frf-timeline/);
});

test('目前 Notion 內容裡沒有誤觸記號的表格', () => {
  if (!fs.existsSync('src/content/frf')) return;
  for (const f of fs.readdirSync('src/content/frf').filter((x) => x.endsWith('.md') && !x.startsWith('zz-'))) {
    const md = fs.readFileSync(`src/content/frf/${f}`, 'utf8');
    for (const line of md.split('\n').filter((l) => l.startsWith('|'))) {
      const first = line.split('|')[1] || '';
      for (const re of Object.values(MARKERS)) assert.doesNotMatch(first, re, `${f}: ${line.slice(0, 40)}`);
    }
  }
});

test('同步腳本照舊把 Notion 表格轉成 markdown 表格（記號就在第一格）', () => {
  const src = fs.readFileSync('scripts/sync-frf-from-notion.mjs', 'utf8');
  assert.match(src, /case 'table':/);
  assert.match(src, /const header = cellText\(rows\[0\]\)/, '第一列一定是表頭，不管 Notion 有沒有開「標題列」');
  assert.ok(componentKind);
});

test('表頭被同步腳本重複印成第一列時，網站上只留一列表頭', async () => {
  const md = '| **項目** | **預估花費** |\n| --- | --- |\n| **項目** | **預估花費** |\n| 新幹線 | ¥14,000 |';
  const { html } = await render(md);
  assert.equal(count(html, /項目/g), 1);
  assert.match(html, /新幹線/);
});

test('同步腳本：表格第一列只印一次（當表頭）', () => {
  const src = fs.readFileSync('scripts/sync-frf-from-notion.mjs', 'utf8');
  const block = src.slice(src.indexOf("case 'table':"), src.indexOf("case 'column_list':"));
  assert.match(block, /rows\.slice\(1\)/);
  assert.doesNotMatch(block, /has_column_header \? 1 : 0/);
});

test('決策卡：標準四欄（如果你｜怎麼做｜代價｜來源），代價在來源前面', async () => {
  const { html } = await render(DEMO);
  const sec = html.slice(html.indexOf('<section class="frf-choice"'), html.indexOf('</section>', html.indexOf('<section class="frf-choice"')));
  assert.equal(count(sec, /<dt>代價<\/dt>/g), 3);
  assert.equal(count(sec, /<dt>來源<\/dt>/g), 1, '來源空著的卡不顯示來源');
  assert.ok(sec.lastIndexOf('<dt>代價</dt>') < sec.indexOf('<dt>來源</dt>'));
  assert.match(sec, /<dt>代價<\/dt><dd>¥14,000；凌晨 1:00/);
});

test('決策卡：欄位照表頭名稱對應，順序寫錯也一樣；其他欄照樣顯示在代價和來源中間', async () => {
  const md = [
    '| 🧭 如果你 | 來源 | 代價 | 怎麼做 | 路線 |',
    '| --- | --- | --- | --- | --- |',
    '| 沒住宿 | 岩盤（2026） | ¥14,000 | 搭夜行巴士 | 會場 → 新宿 |',
  ].join('\n');
  const { html } = await render(md);
  assert.match(html, /<p class="frf-choice-if">如果你：沒住宿<\/p><p class="frf-choice-do">搭夜行巴士<\/p>/);
  assert.match(html, /<dl><dt>代價<\/dt><dd>¥14,000<\/dd><dt>路線<\/dt><dd>會場 → 新宿<\/dd><dt>來源<\/dt><dd>岩盤（2026）<\/dd><\/dl>/);
});

test('決策卡：怎麼做、代價都空著時，那一項不顯示', async () => {
  const md = '| 🧭 如果你 | 怎麼做 | 代價 | 來源 |\n| --- | --- | --- | --- |\n| 還在猶豫 |  |  |  |';
  const { html } = await render(md);
  assert.match(html, /<li class="frf-choice-card"><p class="frf-choice-if">如果你：還在猶豫<\/p><\/li>/);
});

test('不轉卡片：naeba-food 的寬表格在手機上維持原本的表格，其他文章照轉', async () => {
  const wide = '| 品項 | 攤位 | 價格 | 評分 |\n| --- | --- | --- | --- |\n| 和牛粥 | OKAME | ¥1,000 | 4 |';
  assert.doesNotMatch((await render(wide, '/x/src/content/frf/naeba-food.md')).html, /frf-table--stack/);
  assert.doesNotMatch((await render(wide, 'C:\\x\\src\\content\\frf\\naeba-food.md')).html, /frf-table--stack/);
  assert.match((await render(wide, '/x/src/content/frf/hotels-and-inns.md')).html, /frf-table--stack/);
});

test('不轉卡片：naeba-food 裡有記號的元件表格照樣轉', async () => {
  const md = '| 🧭 如果你 | 怎麼做 | 代價 | 來源 |\n| --- | --- | --- | --- |\n| 怕排隊 | 早上先吃 | 要早起 |  |';
  assert.match((await render(md, '/x/src/content/frf/naeba-food.md')).html, /frf-choice-card/);
});
