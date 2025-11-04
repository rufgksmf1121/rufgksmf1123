// app.table.js (improved): 표/링크/상태/진행률/열병합 토글
const MERGE_COLUMNS = [3, 2, 1]; // 화면명, 3Depth, 2Depth
const LINK_COL = 5;
const PATH_COL = 4;

let mergeEnabled = true;
let previewEnabled = true;

// 섹션별 원본 tbody 스냅샷 저장 (언머지 시 복원)
const rawCache = new WeakMap();

export function configureTables() {
  document.querySelectorAll('.js-pub').forEach(table => {
    // tbody 스냅샷 캐싱
    if (!rawCache.has(table)) {
      const tbody = table.tBodies[0];
      rawCache.set(table, tbody ? tbody.innerHTML : '');
    }

    buildLinks(table);
    applyRowStates(table);
    if (mergeEnabled) MERGE_COLUMNS.forEach(idx => mergeEqualCells(table, idx));
  });
  updateProgress();
}

export function toggleMerge() {
  const tables = document.querySelectorAll('.js-pub');
  mergeEnabled = !mergeEnabled;

  tables.forEach(table => {
    const tbody = table.tBodies[0];
    if (!tbody) return;

    // 1) 복원
    const raw = rawCache.get(table) || '';
    tbody.innerHTML = raw;

    // 2) 링크/상태 다시 적용
    buildLinks(table);
    applyRowStates(table);

    // 3) 병합 모드면 병합 적용
    if (mergeEnabled) MERGE_COLUMNS.forEach(idx => mergeEqualCells(table, idx));
  });

  // 진행률 재계산
  updateProgress();

  // 미리보기 리스너는 DOM이 갈아끼워졌으므로 다시 설치하도록 이벤트 알림
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

export function setPreviewEnabled(v) { previewEnabled = v; }
export function isPreviewEnabled(){ return previewEnabled; }

function buildLinks(table) {
  const section = table.closest('.section');
  const secCode = (section?.dataset.code || '').trim();
  const rows = Array.from(table.tBodies[0]?.rows || []);
  for (const tr of rows) {
    const tds = tr.cells;
    if (!tds || tds.length === 0) continue;
    const path = (tds[PATH_COL]?.textContent || '').trim();
    const linkCell = tds[LINK_COL];
    const a = linkCell?.querySelector('a');
    if (!a) continue;
    const base = (a.textContent || '').trim();
    if (!base) continue;
    a.href = computeHref(secCode, path, base);
    a.target = '_blank';
    a.title = '새 창에서 열기';
  }
}

function computeHref(secCode, path, base) {
  const root = 'page';
  const parts = [root];
  if (secCode) {
    parts.push(secCode);
    if (path) parts.push(path);
  } else {
    parts.push(path || '');
  }
  return parts.filter(Boolean).join('/') + '/' + base + '.html';
}

function applyRowStates(table) {
  const rows = Array.from(table.tBodies[0]?.rows || []);
  for (const tr of rows) {
    const last = (tr.cells[tr.cells.length - 1]?.textContent || '').trim();
    if (!last) continue;
    if (last.includes('삭제')) { tr.classList.add('row-muted'); strikeLink(tr); }
    else if (last.includes('완료')) { tr.classList.add('row-done'); }
    else if (last.includes('수정')) { tr.classList.add('row-edit'); }
    else if (last.includes('작업예정')) { tr.classList.add('row-work'); }
    else if (last.includes('보류')) { tr.classList.add('row-hold'); }
  }
}

function strikeLink(tr) {
  const td = tr.cells[LINK_COL];
  if (!td) return;
  const a = td.querySelector('a');
  if (!a) return;
  const s = document.createElement('s'); s.textContent = a.textContent;
  a.replaceWith(s);
}

function mergeEqualCells(table, colIndex) {
  const tbody = table.tBodies[0]; if (!tbody) return;
  let prev = null, start = null, span = 1;
  for (const tr of Array.from(tbody.rows)) {
    const td = tr.cells[colIndex]; if (!td) continue;
    const text = td.textContent.trim(); if (text === '') { prev=null; start=null; span=1; continue; }
    if (prev === text) { span++; td.remove(); }
    else {
      if (start && span > 1) start.rowSpan = span;
      prev = text; start = td; span = 1;
    }
  }
  if (start && span > 1) start.rowSpan = span;
}

function updateProgress() {
  const tables = document.querySelectorAll('.js-count');
  const rows = Array.from(tables).flatMap(t => Array.from(t.tBodies[0]?.rows || []));
  const excluded = rows.filter(r => r.classList.contains('row-muted') || r.classList.contains('row-hold')).length;
  const total = rows.length - excluded;
  const done = rows.filter(r => r.classList.contains('row-done') || r.classList.contains('row-edit')).length;
  const percent = total > 0 ? (done / total) * 100 : 0;

  setText('#total', total);
  setText('#done', done);
  setText('#percent', percent.toFixed(2) + '%');
}

function setText(sel, v){ const el=document.querySelector(sel); if(el) el.textContent=String(v); }

export { computeHref };
