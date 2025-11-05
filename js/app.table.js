
// app.table.js (KYH-style minimal, fixed)
let previewEnabled = true;
export const isPreviewEnabled = () => previewEnabled;
export const setPreviewEnabled = (v)=> (previewEnabled = !!v);

const SAMPLE_FILES = {
  MAIN: ['sample/sample3.html','sample/sample4.html'],
  CM:   ['sample/sample1.html','sample/sample2.html'],
  DT:   ['sample/sample1.html','sample/sample2.html'],
  LG:   ['sample/sample1.html','sample/sample2.html'],
  CN:   ['sample/sample1.html','sample/sample2.html'],
  MN:   ['sample/sample1.html','sample/sample2.html'],
  CF:   ['sample/sample1.html','sample/sample2.html'],
  DS:   ['sample/sample1.html','sample/sample2.html'],
  DC:   ['sample/sample1.html','sample/sample2.html'],
  CMP:  ['sample/sample1.html'],
  APR:  ['sample/sample1.html']
};

function buildHref(sectionCode, pathText, urlText){
  const txt = (urlText || '').trim();
  const path = (pathText || '').trim();
  const code = (sectionCode || '').trim();
  if (!txt) return '';
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
    if (!table) return;
    let rowIdx = 0;
    [...table.tBodies[0].rows].forEach(tr=>{
      const tds = tr.cells;
      const pathCell = tds[4];
      const urlCell  = tds[5];
      const a = urlCell?.querySelector('a');
      if (!a) return;
      let href = buildHref(code, pathCell?.textContent, a.textContent);
      if (code && SAMPLE_FILES[code]) {
        const list = SAMPLE_FILES[code];
        const name = list[Math.min(rowIdx, list.length-1) % list.length];
        href = `page/${code}/${name}`;
        rowIdx++;
      }
      a.setAttribute('href', href);
      a.setAttribute('target','_blank');
      a.setAttribute('title','새창열림');
    });
  });

  const countRows = [...document.querySelectorAll('.js-count tbody tr')];
  const done = countRows.filter(tr => tr.classList.contains('row-done') || tr.classList.contains('row-edit')).length;
  const total = countRows.filter(tr => !tr.classList.contains('row-muted') && !tr.classList.contains('row-hold')).length;
  const percent = total ? ((done / total) * 100).toFixed(2) : '0.00';

  const doneEl = document.getElementById('done');   if (doneEl)   doneEl.textContent   = String(done);
  const totalEl = document.getElementById('total'); if (totalEl)  totalEl.textContent  = String(total);
  const pctEl   = document.getElementById('percent'); if (pctEl) pctEl.textContent = `${percent}%`;

  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

export function toggleMerge(){
  const targets = document.querySelectorAll('table.grid');
  targets.forEach(tbl => {
    const on = tbl.getAttribute('data-merge') === 'on';
    tbl.setAttribute('data-merge', on ? 'off' : 'on');
    if (on) { configureTables(); return; }
    mergeColumn(tbl, 1); mergeColumn(tbl, 2); mergeColumn(tbl, 3);
  });
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

function mergeColumn(tbl, colIndex){
  let prev = null, span = 1;
  [...tbl.tBodies[0].rows].forEach((tr)=>{
    const td = tr.cells[colIndex];
    if (!td) return;
    const txt = td.textContent.trim();
    if (prev && prev.text === txt && txt !== '') {
      span++; td.remove(); prev.td.rowSpan = span;
    } else { prev = { text: txt, td }; span = 1; }
  });
}

export function initSideNav(){
  const nav = document.getElementById('sideNav'); if (!nav) return;
  nav.addEventListener('click',(e)=>{
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const target = document.querySelector(a.getAttribute('href')); if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior:'smooth' });
    history.replaceState(null,'',a.getAttribute('href'));
  });
  const sections = [...document.querySelectorAll('.section[id]')];
  const io = new IntersectionObserver((entries)=>{
    const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!visible) return;
    const id = '#' + visible.target.id;
    [...nav.querySelectorAll('a')].forEach(x=>x.classList.toggle('active', x.getAttribute('href')===id));
  },{ rootMargin:'-55% 0px -40% 0px', threshold:[0,1] });
  sections.forEach(s=>io.observe(s));
}
