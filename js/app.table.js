
// app.table.js — table utilities (no style changes)
let previewEnabled = true;
export const isPreviewEnabled = ()=> previewEnabled;
export const setPreviewEnabled = (v)=> (previewEnabled = !!v);

// sectionCode is in .section[data-code]
function buildHref(sectionCode, pathText, urlText){
  const txt  = (urlText  || '').trim();
  const path = (pathText || '').trim();
  const code = (sectionCode || '').trim();
  if (!txt) return '';
  // special case for ../../ which points to project root
  if (!code) {
    if (path === '../../') return `${path}${txt}.html`;
    return `page/${path}/${txt}.html`;
  }
  const mid = path ? `${path}/` : '';
  return `page/${code}/${mid}${txt}.html`;
}

export function configureTables(){
  document.querySelectorAll('.section').forEach(section=>{
    const code = section.dataset.code || '';
    const table = section.querySelector('table.grid');
    if (!table || !table.tBodies[0]) return;
    [...table.tBodies[0].rows].forEach(tr=>{
      const tds = tr.cells;
      if (!tds || tds.length < 6) return;
      const pathCell = tds[4];
      const urlCell  = tds[5];
      const a = urlCell?.querySelector('a');
      if (!a) return;
      const href = buildHref(code, pathCell?.textContent, a.textContent);
      if (!href) return;
      a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('title', '새창열림');
    });
  });

  // 진행상황 카운팅 (row 클래스 기반)
  const countRows = [...document.querySelectorAll('.js-count tbody tr')];
  const done   = countRows.filter(tr => tr.classList.contains('row-done') || tr.classList.contains('row-edit')).length;
  const total  = countRows.filter(tr => !tr.classList.contains('row-muted') && !tr.classList.contains('row-hold')).length;
  const percent = total ? ((done/total)*100).toFixed(2) : '0.00';
  const $ = (id)=>document.getElementById(id);
  if ($('done'))   $('done').textContent = done;
  if ($('total'))  $('total').textContent = total;
  if ($('percent'))$('percent').textContent = percent + '%';

  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

// 열 병합 on/off
export function toggleMerge(){
  const tables = document.querySelectorAll('table.grid');
  tables.forEach(tbl=>{
    const on = tbl.getAttribute('data-merge') === 'on';
    tbl.setAttribute('data-merge', on ? 'off' : 'on');
    if (on) { configureTables(); return; }
    // 병합 순서: 2,3,4번째 표시열(인덱스 1~3)
    mergeColumn(tbl, 1); mergeColumn(tbl, 2); mergeColumn(tbl, 3);
  });
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

function mergeColumn(tbl, colIndex){
  if (!tbl.tBodies[0]) return;
  let prev = null, span = 1;
  [...tbl.tBodies[0].rows].forEach(tr=>{
    const td = tr.cells[colIndex]; if (!td) return;
    const txt = td.textContent.trim();
    if (prev && prev.text === txt && txt !== ''){
      span++; td.remove(); prev.td.rowSpan = span;
    } else {
      prev = {text: txt, td}; span = 1;
    }
  });
}

// 사이드 내비게이션: 해당 섹션으로 스크롤
export function initSideNav(){
  const nav = document.getElementById('sideNav'); if (!nav) return;
  nav.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href')); if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior:'smooth' });
    history.replaceState(null,'',a.getAttribute('href'));
  });
  const sections = [...document.querySelectorAll('.section[id]')];
  const io = new IntersectionObserver((entries)=>{
    const visible = entries.filter(e=>e.isIntersecting)
                           .sort((a,b)=>a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const id = '#' + visible.target.id;
    [...nav.querySelectorAll('a')].forEach(x=>x.classList.toggle('active', x.getAttribute('href')===id));
  }, { rootMargin:'-55% 0px -40% 0px', threshold:[0,1] });
  sections.forEach(s=>io.observe(s));
}

export function initToolbar({ onToggleMerge, onTogglePreview }){
  const mergeBtn = document.getElementById('btnMerge');
  const prevBtn  = document.getElementById('btnPreview');
  if (mergeBtn){
    mergeBtn.addEventListener('click', ()=>{
      onToggleMerge?.(); mergeBtn.classList.toggle('on');
    });
  }
  if (prevBtn){
    prevBtn.addEventListener('click', ()=>{
      const pressed = !prevBtn.classList.contains('on');
      prevBtn.classList.toggle('on', pressed);
      onTogglePreview?.(pressed);
    });
  }
}
