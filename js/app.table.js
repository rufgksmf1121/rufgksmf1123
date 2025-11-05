// State & exports used by other modules
export const setPreviewEnabled = (v)=>{ window.__previewEnabled = !!v; };

export function configureTables(){
  // Respect existing links; only update numbers & counters
  renumberRows();
  updateCounters();
  // announce
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

function renumberRows(){
  document.querySelectorAll('table.grid tbody').forEach(tbody=>{
    let i=0;
    tbody.querySelectorAll('tr').forEach(tr=>{
      if (tr.style.display === 'none') return;
      // No cell text change needed; CSS counter handles "No."
      i++;
    });
  });
}

function updateCounters(){
  const countRows = [...document.querySelectorAll('.js-count tbody tr')];
  const done = countRows.filter(tr => tr.classList.contains('row-done') || tr.classList.contains('row-edit')).length;
  const total = countRows.filter(tr => !tr.classList.contains('row-muted') && !tr.classList.contains('row-hold')).length;
  const percent = total ? ((done / total) * 100).toFixed(2) : '0.00';
  const $done = document.getElementById('done');
  const $total = document.getElementById('total');
  const $percent = document.getElementById('percent');
  if ($done) $done.textContent = done;
  if ($total) $total.textContent = total;
  if ($percent) $percent.textContent = `${percent}%`;
}

export function toggleMerge(){
  const targets = document.querySelectorAll('table.grid');
  targets.forEach(tbl => {
    const on = tbl.getAttribute('data-merge') === 'on';
    tbl.setAttribute('data-merge', on ? 'off' : 'on');
  });
}

// Side nav: smooth scroll + active link
export function initSideNav(){
  const nav = document.getElementById('sideNav'); if (!nav) return;
  nav.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const target = document.querySelector(a.getAttribute('href')); if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior:'smooth' });
      history.replaceState(null,'',a.getAttribute('href'));
    });
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
