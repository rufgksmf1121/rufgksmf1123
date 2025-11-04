// js/app.table.js
const MERGE_COLUMNS = [3,2,1];        // 화면명, 3Depth, 2Depth
const LINK_COL = 5, PATH_COL = 4;

let mergeEnabled = true;
let previewEnabled = true;
const rawCache = new WeakMap();

export function configureTables(){
  document.querySelectorAll('.js-pub').forEach(tbl=>{
    if(!rawCache.has(tbl)){
      const tb = tbl.tBodies[0];
      rawCache.set(tbl, tb ? tb.innerHTML : '');
    }
    buildLinks(tbl);
    applyRowStates(tbl);
    if(mergeEnabled) MERGE_COLUMNS.forEach(i=>mergeEqualCells(tbl,i));
  });
  updateProgress();
}

export function toggleMerge(){
  mergeEnabled = !mergeEnabled;
  document.querySelectorAll('.js-pub').forEach(tbl=>{
    const tb = tbl.tBodies[0]; if(!tb) return;
    tb.innerHTML = rawCache.get(tbl) || '';
    buildLinks(tbl);
    applyRowStates(tbl);
    if(mergeEnabled) MERGE_COLUMNS.forEach(i=>mergeEqualCells(tbl,i));
  });
  updateProgress();
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

export function setPreviewEnabled(v){ previewEnabled = v; }
export function isPreviewEnabled(){ return previewEnabled; }

/** 링크 href 생성 + 바인딩 */
function buildLinks(tbl){
  const sec = tbl.closest('.section');
  const code = (sec?.dataset.code||'').trim();

  Array.from(tbl.tBodies[0]?.rows||[]).forEach(tr=>{
    const tds = tr.cells; if(!tds || !tds.length) return;
    const path = (tds[PATH_COL]?.textContent||'').trim();
    const linkCell = tds[LINK_COL];
    const a = linkCell?.querySelector('a');
    if(!a) return;
    const base = (a.textContent||'').trim();
    if(!base) return;
    a.href = computeHref(code, path, base);
    a.target = '_blank';
    a.title = '새 창에서 열기';
  });
}

/** 경로 정리 규칙 */
export function computeHref(secCode, path, base){
  const p = (path || '').trim();

  // 1) 절대/외부 링크면 그대로
  if (/^(https?:)?\/\//.test(p)) {
    return p.replace(/\/+$/, '') + '/' + base + '.html';
  }

  // 2) ../../, ./, / 같은 상대/루트 표기 정리
  const cleaned = p
    .replace(/^\.\.\/\.\.\//, '')  // "../../" 제거
    .replace(/^\.\/+/, '')         // "./" 제거
    .replace(/^\/+/, '');          // 선행 슬래시 제거

  const parts = ['page'];
  if (secCode) {
    parts.push(secCode);
    if (cleaned) parts.push(cleaned);
  } else {
    if (cleaned) parts.push(cleaned);
  }

  return parts.filter(Boolean).join('/') + '/' + base + '.html';
}

/** 상태 색/취소선 */
function applyRowStates(tbl){
  Array.from(tbl.tBodies[0]?.rows||[]).forEach(tr=>{
    const last = (tr.cells[tr.cells.length-1]?.textContent||'').trim();
    if(!last) return;
    if(last.includes('삭제')) { tr.classList.add('row-muted'); strike(tr); }
    else if(last.includes('완료')) tr.classList.add('row-done');
    else if(last.includes('수정')) tr.classList.add('row-edit');
    else if(last.includes('작업예정')) tr.classList.add('row-work');
    else if(last.includes('보류')) tr.classList.add('row-hold');
  });
}

function strike(tr){
  const td = tr.cells[LINK_COL]; if(!td) return;
  const a = td.querySelector('a'); if(!a) return;
  const s = document.createElement('s'); s.textContent = a.textContent; a.replaceWith(s);
}

/** 동일 텍스트 셀 병합 */
function mergeEqualCells(tbl, idx){
  const tb = tbl.tBodies[0]; if(!tb) return;
  let prev=null, start=null, span=1;
  for(const tr of Array.from(tb.rows)){
    const td = tr.cells[idx]; if(!td) continue;
    const t = td.textContent.trim(); if(t===''){ prev=null; start=null; span=1; continue; }
    if(prev===t){ span++; td.remove(); }
    else{ if(start && span>1) start.rowSpan=span; prev=t; start=td; span=1; }
  }
  if(start && span>1) start.rowSpan=span;
}

function updateProgress(){
  const rows = Array.from(document.querySelectorAll('.js-count')).flatMap(t=>Array.from(t.tBodies[0]?.rows||[]));
  const excluded = rows.filter(r=>r.classList.contains('row-muted')||r.classList.contains('row-hold')).length;
  const total = rows.length - excluded;
  const done = rows.filter(r=>r.classList.contains('row-done')||r.classList.contains('row-edit')).length;
  const pct = total>0 ? (done/total)*100 : 0;
  set('#total', total); set('#done', done); set('#percent', pct.toFixed(2)+'%');
}
function set(sel, v){ const el=document.querySelector(sel); if(el) el.textContent=String(v); }
