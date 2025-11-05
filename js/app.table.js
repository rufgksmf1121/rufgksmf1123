let previewEnabled = true;
export const isPreviewEnabled = () => previewEnabled;
export const setPreviewEnabled = (v)=> (previewEnabled = !!v);

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
    [...table.tBodies[0].rows].forEach(tr=>{
      const tds = tr.cells;
      const pathCell = tds[4];
      const urlCell  = tds[5];
      const a = urlCell?.querySelector('a');
      if (!a) return;
      const href = buildHref(code, pathCell?.textContent, a.textContent);
      if (!href) return;
      a.setAttribute('href', href);
      a.setAttribute('target','_blank');
      a.setAttribute('title','새창열림');
    });
  });

  const countRows = [...document.querySelectorAll('.js-count tbody tr')];
  const done = countRows.filter(tr => tr.classList.contains('row-done') || tr.classList.contains('row-edit')).length;
  const total = countRows.filter(tr => !tr.classList.contains('row-muted') && !tr.classList.contains('row-hold')).length;
  const percent = total ? ((done / total) * 100).toFixed(2) : '0.00';
  document.getElementById('done')?.textContent = done;
  document.getElementById('total')?.textContent = total;
  document.getElementById('percent')?.textContent = `${percent}%`;
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
    e.preventDefault(); target.scrollIntoView({ behavior:'smooth', block:'start' });
    history.replaceState(null,'',a.getAttribute('href')); setActive(a);
  });
  const setActive = (el)=>{
    [...nav.querySelectorAll('a')].forEach(x=>x.classList.remove('active'));
    el.classList.add('active');
  };
  const sections = [...document.querySelectorAll('.section[id]')];
  const io = new IntersectionObserver((entries)=>{
    const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!visible) return;
    const link = nav.querySelector(`a[href="#${visible.target.id}"]`);
    if (link) setActive(link);
  },{ rootMargin:'-40% 0px -50% 0px', threshold:[0,1] });
  sections.forEach(s=>io.observe(s));
}