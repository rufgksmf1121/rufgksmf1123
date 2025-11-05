
// app.table.js — keep original look; only compute hrefs + counters
export function configureTables(){
  // Build hrefs from table cells, keeping original DOM
  document.querySelectorAll('.pub_list').forEach(tbl=>{
    tbl.querySelectorAll('tbody tr').forEach(tr=>{
      const tds = tr.cells;
      if (!tds || tds.length < 6) return;
      const pathCell = tds[4];
      const urlCell  = tds[5];
      const a = urlCell ? urlCell.querySelector('a') : null;
      if (!a) return;
      const urlText  = (a.textContent || "").trim();
      const pathText = (pathCell.textContent || "").trim();
      // find section code from nearest heading (same as original)
      let code = "";
      const section = tr.closest('.section');
      if (section){
        const span = section.querySelector('.tit2 span');
        if (span) code = (span.textContent || "").trim();
      }
      const href = buildHref(code, pathText, urlText);
      if (!href) return;
      a.setAttribute("href", href);
      a.setAttribute("target", "_blank");
      a.setAttribute("title", "새창열림");
    });
  });

  // progress counter (same visual spots as original)
  const countRows = [...document.querySelectorAll('.count_list tbody tr')];
  const notCount = countRows.filter(tr => tr.classList.contains('not') || tr.classList.contains('hold')).length;
  const doneCount = countRows.filter(tr => tr.classList.contains('done') || tr.classList.contains('edit')).length;
  const total = countRows.length - notCount;
  const percentage = total ? (doneCount / total) * 100 : 0;
  const wrap = document.querySelector('.info_zone .progress');
  if (wrap){
    const totalEl = wrap.querySelector('.total'); if (totalEl) totalEl.textContent = total;
    const pageEl  = wrap.querySelector('.page');  if (pageEl)  pageEl.textContent  = doneCount;
    const perEl   = wrap.querySelector('.percent'); if (perEl) perEl.textContent = percentage.toFixed(2) + '%';
  }

  // announce for preview installer
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

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
