// npm test
import assert from 'node:assert/strict';
import test from 'node:test';
import { richText } from './rich-text.mjs';

const seg = (text, annotations = {}, href = null) => ({
  plain_text: text,
  href,
  annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default', ...annotations },
});

test('同一句粗體裡夾著變色、底線的字，合併成一段粗體', () => {
  const md = richText([
    seg('末班新幹線為 ', { bold: true }),
    seg('22:25', { bold: true, underline: true, color: 'red' }),
    seg('，所以要抓好時間。', { bold: true }),
  ]);
  assert.equal(md, '**末班新幹線為 22:25，所以要抓好時間。**');
  assert.ok(!md.includes('****'));
});

test('粗體結尾帶括號的情況（住宿那篇）不產生 ****', () => {
  const md = richText([
    seg('私人計日停車方案(', { bold: true }),
    seg('¥2,000-¥3,000/日)', { bold: true, color: 'red' }),
  ]);
  assert.equal(md, '**私人計日停車方案(¥2,000-¥3,000/日)**');
});

test('樣式不同的相鄰段落各自加標記', () => {
  assert.equal(richText([seg('一般 '), seg('粗體', { bold: true }), seg(' 一般')]), '一般 **粗體** 一般');
});

test('粗體前後的空白放在標記外面', () => {
  assert.equal(richText([seg('前'), seg(' 粗 ', { bold: true }), seg('後')]), '前 **粗** 後');
});

test('只有空白的粗體段不產生 ** **', () => {
  assert.equal(richText([seg('甲'), seg(' ', { bold: true }), seg('乙')]), '甲 乙');
});

test('Shift+Enter 換行變成 <br>，不換真的行', () => {
  const md = richText([seg('新手結語：', { bold: true }), seg('\n交通看似複雜。\n現在出發吧！')]);
  assert.equal(md, '**新手結語：**<br>交通看似複雜。<br>現在出發吧！');
  assert.ok(!md.includes('\n'));
});

test('粗體裡的換行也保留', () => {
  assert.equal(richText([seg('第一行\n第二行', { bold: true })]), '**第一行<br>第二行**');
});

test('連結：同一個網址的相鄰段合併，文字裡的方括號拿掉', () => {
  const url = 'https://echigo.fans/';
  assert.equal(richText([seg('越後', {}, url), seg('[飯]', { color: 'red' }, url)]), '[越後飯](https://echigo.fans/)');
});

test('行內程式碼不轉 <br>', () => {
  assert.equal(richText([seg('a\nb', { code: true })]), '`a b`');
});

test('空陣列回傳空字串', () => {
  assert.equal(richText([]), '');
  assert.equal(richText(undefined), '');
});
