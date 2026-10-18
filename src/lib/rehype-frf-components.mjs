// 富士搖滾文章的三種版面元件，作者在 Notion 用「表格」寫，第一列第一格放記號：
//
//   💰 預算總覽…   → 預算總覽卡（總額、明細、小計、還沒算進去、來源）
//   🧭 如果你…     → 決策卡（每一列是一個選項：如果你／怎麼做／其他欄）
//   🕒 時間軸…     → 時間軸（每一列是一站：站名／怎麼走／時間、費用…／注意）
//
// 為什麼用表格：同步腳本（scripts/sync-frf-from-notion.mjs）會把 Notion 表格原樣轉成 markdown 表格，
// 粗體、連結都留著；提示框和切換清單的子區塊會被拆開，不適合放結構化的內容。
// 寫法說明見 docs/frf-rewrite/components.md。
//
// 另外：沒有記號、四欄以上的一般比較表，加上 data-label，手機上用 CSS 排成一列一張卡片。

const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));
const el = (tagName, className, children = [], extra = {}) => ({
  type: 'element',
  tagName,
  properties: { ...(className ? { className: [].concat(className) } : {}), ...extra },
  children,
});
const txt = (value) => ({ type: 'text', value });

/** 表格 → [[儲存格的 children…]…]，第一列是表頭 */
export function tableRows(table) {
  const rows = [];
  const walk = (n) => {
    if (n.type === 'element' && n.tagName === 'tr') {
      rows.push((n.children || []).filter((c) => c.type === 'element' && (c.tagName === 'th' || c.tagName === 'td')));
      return;
    }
    for (const c of n.children || []) walk(c);
  };
  walk(table);
  return rows;
}

const cellText = (c) => (c ? textOf(c).replace(/\s+/g, ' ').trim() : '');
const cellKids = (c) => {
  const kids = (c?.children || []).filter((k) => !(k.type === 'text' && !k.value.trim()));
  return kids;
};

// 第一格開頭的記號。記號後面的文字是標題／副標。
const DECOR = '[\\s\\uFE0F\\u200D]*';
export const MARKERS = {
  cost: new RegExp(`^\\s*💰${DECOR}預算總覽\\s*[：:｜|・]?\\s*`, 'u'),
  choice: new RegExp(`^\\s*🧭${DECOR}如果你\\s*[：:｜|・]?\\s*`, 'u'),
  timeline: new RegExp(`^\\s*🕒${DECOR}時間軸\\s*[：:｜|・]?\\s*`, 'u'),
};

/** 這張表是哪一種元件；一般表格回 null */
export function componentKind(table) {
  const head = cellText(tableRows(table)[0]?.[0]);
  for (const [kind, re] of Object.entries(MARKERS)) if (re.test(head)) return kind;
  return null;
}

// 儲存格開頭的 ⚠️：這一項用紅色（只留給「會多花錢、會趕不上車」等級的事）
const WARN = /^\s*⚠\uFE0F?\s*/u;
function stripLead(kids, re) {
  const out = kids.map((k) => (k.type === 'text' ? { ...k } : k));
  const first = (function find(list) {
    for (const k of list) {
      if (k.type === 'text') return k;
      if (k.children) { const r = find(k.children); if (r) return r; }
    }
    return null;
  })(out);
  if (first) first.value = first.value.replace(re, '');
  return out;
}

// ── 預算總覽卡 ─────────────────────────────────────────────
const COST_TOTAL = /^(總計|合計|總額)/;
const COST_SUB = /小計/;
const COST_OUT = /^(還沒算進去|還沒算|未含|不含|另計)/;
const COST_SRC = /^(來源|資料來源|價格來源)/;

export function costCard(table) {
  const [head, ...rows] = tableRows(table);
  const title = cellText(head[0]).replace(MARKERS.cost, '').trim();
  let total = null;
  const lines = [];
  const after = [];
  for (const r of rows) {
    const label = cellText(r[0]);
    if (!label) continue;
    const amount = cellKids(r[1]);
    const note = cellKids(r[2]);
    if (COST_TOTAL.test(label)) {
      total = { amount, note };
    } else if (COST_OUT.test(label)) {
      after.push(el('p', 'frf-cost-out', [el('strong', null, [txt(`${label}：`)]), ...amount, ...(note.length ? [txt(' '), ...note] : [])]));
    } else if (COST_SRC.test(label)) {
      after.push(el('p', 'frf-cost-src', [txt(`${label}：`), ...amount, ...(note.length ? [txt(' '), ...note] : [])]));
    } else {
      const sub = COST_SUB.test(label);
      lines.push(el('li', sub ? 'frf-cost-sum' : null, [
        el('span', 'frf-cost-k', [
          txt(sub ? label.replace(/^小計\s*[：:]\s*/, '').replace(/^(.+)$/, (m) => (/小計/.test(m) ? m : `${m}小計`)) : label),
          ...(note.length ? [el('small', null, note)] : []),
        ]),
        el('span', 'frf-cost-v', amount),
      ]));
    }
  }
  const kids = [el('p', 'frf-cost-label', [txt(title ? `預算總覽・${title}` : '預算總覽')])];
  if (total) {
    kids.push(el('p', 'frf-cost-total', total.amount));
    if (total.note.length) kids.push(el('p', 'frf-cost-sub', total.note));
  }
  if (lines.length) kids.push(el('ul', 'frf-cost-lines', lines));
  kids.push(...after);
  return el('aside', 'frf-cost', kids, { ariaLabel: title ? `預算總覽：${title}` : '預算總覽' });
}

// ── 決策卡 ───────────────────────────────────────────────
// 標準是固定四欄，表頭：🧭 如果你 ｜ 怎麼做 ｜ 代價 ｜ 來源
//   如果你：讀者的情況，印成卡片上方的小字（開頭 ⚠️ 這張卡變紅色）
//   怎麼做：卡片標題
//   代價：要多花的錢、時間，或會錯過什麼
//   來源：連結＋年份
// 空格那一項在這張卡上不顯示。欄位照表頭名稱對應，順序寫錯也認得；
// 其他名稱的欄位照樣顯示（排在代價後面、來源前面），但標準是上面四欄。
export const CHOICE_COLUMNS = ['如果你', '怎麼做', '代價', '來源'];

export function choiceColumns(head) {
  const labels = head.map(cellText);
  const find = (name) => labels.findIndex((l, i) => i > 0 && l.replace(/[*\s]/g, '') === name);
  let todo = find('怎麼做');
  if (todo === -1) todo = 1; // 沒寫欄名時，第二欄當「怎麼做」
  const cost = find('代價');
  const source = find('來源');
  const extra = labels.map((_, i) => i).filter((i) => i > 0 && i !== todo && i !== cost && i !== source);
  return { labels, todo, cost, source, extra };
}

export function choiceCards(table) {
  const [head, ...rows] = tableRows(table);
  const question = cellText(head[0]).replace(MARKERS.choice, '').trim();
  const { labels, todo, cost, source, extra } = choiceColumns(head);
  const fieldOrder = [cost, ...extra, source].filter((i) => i > 0);
  const cards = [];
  for (const r of rows) {
    const cond = cellKids(r[0]);
    const condText = cellText(r[0]);
    if (!condText) continue;
    const warn = WARN.test(condText);
    const fields = [];
    for (const i of fieldOrder) {
      if (!cellText(r[i])) continue;
      fields.push(el('dt', null, [txt(labels[i] || '')]), el('dd', null, cellKids(r[i])));
    }
    cards.push(el('li', ['frf-choice-card', ...(warn ? ['is-warn'] : [])], [
      el('p', 'frf-choice-if', [txt('如果你：'), ...stripLead(cond, WARN)]),
      ...(cellText(r[todo]) ? [el('p', 'frf-choice-do', cellKids(r[todo]))] : []),
      ...(fields.length ? [el('dl', null, fields)] : []),
    ]));
  }
  return el('section', 'frf-choice', [
    ...(question ? [el('p', 'frf-choice-q', [txt(question)])] : []),
    el('ol', 'frf-choice-list', cards),
  ], { ariaLabel: question || '怎麼選' });
}

// ── 時間軸 ───────────────────────────────────────────────
const TL_NOTE = /^(注意|提醒|備註|備注)/;
export function timeline(table) {
  const [head, ...rows] = tableRows(table);
  const title = cellText(head[0]).replace(MARKERS.timeline, '').trim();
  const labels = head.map(cellText);
  const steps = [];
  for (const r of rows) {
    if (!cellText(r[0])) continue;
    const meta = [];
    const notes = [];
    for (let i = 2; i < r.length; i++) {
      const t = cellText(r[i]);
      if (!t) continue;
      if (TL_NOTE.test(labels[i] || '')) {
        const warn = WARN.test(t);
        notes.push(el('p', ['frf-tl-note', ...(warn ? ['is-warn'] : [])], stripLead(cellKids(r[i]), WARN)));
      } else {
        meta.push(el('li', null, [el('span', 'frf-tl-k', [txt(labels[i] || '')]), txt(' '), ...cellKids(r[i])]));
      }
    }
    const body = [
      ...(cellText(r[1]) ? [el('p', 'frf-tl-do', cellKids(r[1]))] : []),
      ...(meta.length ? [el('ul', 'frf-tl-meta', meta)] : []),
      ...notes,
    ];
    steps.push(el('li', 'frf-tl-step', [
      el('p', 'frf-tl-stop', cellKids(r[0])),
      ...(body.length ? [el('div', 'frf-tl-body', body)] : []),
    ]));
  }
  return el('section', 'frf-timeline', [
    ...(title ? [el('p', 'frf-timeline-title', [txt(title)])] : []),
    el('ol', 'frf-tl', steps),
  ], { ariaLabel: title || '時間軸' });
}

// ── 一般寬表格：手機上一列一張卡 ────────────────────────────────
export const STACK_MIN_COLS = 4;
// 不轉卡片的文章（slug）：手機上維持原本的表格。naeba-food 的品項表之後會換別的呈現方式（Gina，2026-10-18）。
export const NO_STACK_SLUGS = ['naeba-food'];
export const slugOfPath = (where) => (String(where).replace(/\\/g, '/').match(/\/content\/frf\/([^/]+)\.md$/) || [])[1] || '';
export const STACK_MAX_ROWS = 12;
export function stackTable(table) {
  const [head, ...rows] = tableRows(table);
  if (!head || head.length < STACK_MIN_COLS || rows.length === 0 || rows.length > STACK_MAX_ROWS) return false;
  const labels = head.map(cellText);
  for (const r of rows) {
    r.forEach((c, i) => {
      const empty = !cellText(c);
      c.properties = {
        ...(c.properties || {}),
        dataLabel: labels[i] || '',
        ...(empty ? { className: [...[].concat(c.properties?.className || []), 'is-empty'] } : {}),
      };
      // 手機卡片的格子是「標籤＋內容」兩欄，內容包成一個 span，粗體和一般字才不會被拆成好幾格
      if (!empty && i > 0) c.children = [el('span', 'frf-cell', c.children || [])];
    });
  }
  table.properties = { ...(table.properties || {}), className: [...[].concat(table.properties?.className || []), 'frf-table--stack'] };
  return true;
}

// Notion 表格沒開「標題列」時，舊版同步腳本會把第一列印兩次（表頭一次、內容第一列又一次）。
// 內容第一列跟表頭一字不差就拿掉（同步腳本已修，這裡處理還沒重新同步的文章）。
export function dropRepeatedHeader(table) {
  const rows = tableRows(table);
  if (rows.length < 2) return false;
  const sig = (r) => r.map(cellText).join('\u0001');
  if (sig(rows[0]) !== sig(rows[1])) return false;
  const remove = (n) => {
    for (const c of n.children || []) {
      if (c.type === 'element' && c.tagName === 'tr' && (c.children || []).some((x) => rows[1].includes(x))) {
        n.children = n.children.filter((x) => x !== c);
        return true;
      }
      if (remove(c)) return true;
    }
    return false;
  };
  return remove(table);
}

const BUILD = { cost: costCard, choice: choiceCards, timeline };

export function rehypeFrfComponents() {
  return (tree, file) => {
    const where = String(file?.path || file?.history?.[0] || '').replace(/\\/g, '/');
    if (!where.includes('/content/frf/')) return;
    const stack = !NO_STACK_SLUGS.includes(slugOfPath(where));
    const walk = (parent) => {
      const kids = parent.children || [];
      for (let i = 0; i < kids.length; i++) {
        const n = kids[i];
        if (n.type !== 'element') continue;
        if (n.tagName === 'table') {
          dropRepeatedHeader(n);
          const kind = componentKind(n);
          if (kind) kids[i] = BUILD[kind](n);
          else if (stack) stackTable(n);
          continue;
        }
        walk(n);
      }
    };
    walk(tree);
  };
}
