// 桌面目錄（≥1240px）浮在內文右側：寬度與負邊距必須跟著視窗算，不能超出畫面。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/frf.css', import.meta.url), 'utf8');

function desktopTocRule() {
  const at = css.indexOf('@media (min-width: 1240px)', css.indexOf('.frf-tocbox {'));
  assert.ok(at > 0, '找不到桌面目錄的 media query');
  const start = css.indexOf('.frf-tocbox {', at);
  return css.slice(start, css.indexOf('}', start));
}

test('桌面目錄寬度跟著視窗算，不用寫死的負邊距', () => {
  const rule = desktopTocRule();
  assert.match(rule, /--toc-w:\s*min\(220px,\s*calc\(\(100vw - 760px\) \/ 2/);
  assert.match(rule, /width:\s*var\(--toc-w\)/);
  assert.match(rule, /margin:[^;]*calc\(-1 \* \(var\(--toc-w\) \+ var\(--toc-gap\)\)\)/);
  assert.doesNotMatch(rule, /margin:[^;]*-\d+px/, '不要寫死負邊距，視窗窄時會超出畫面');
});

test('長目錄項目會換行，不會被切掉', () => {
  assert.match(css, /\.frf-tocbox li, \.frf-tocbox a \{ overflow-wrap: anywhere; \}/);
});

test('各寬度下目錄右緣都在畫面內（用同一條公式算）', () => {
  const gap = 40, edge = 32, content = 760, scrollbar = 15;
  for (const vw of [1240, 1280, 1366, 1440, 1920]) {
    const w = Math.min(220, (vw - content) / 2 - gap - edge);
    assert.ok(w >= 150, `${vw}px 目錄太窄：${w}`);
    const cw = vw - scrollbar; // 有捲軸時的版面寬
    for (const layout of [vw, cw]) {
      const right = (layout + content) / 2 + gap + w;
      assert.ok(right <= layout, `${vw}px 目錄右緣 ${right} 超出 ${layout}`);
    }
  }
});
