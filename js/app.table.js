function buildHref(sectionCode, pathText, urlText){
  const txt  = (urlText||'').trim();
  const path = (pathText||'').trim();
  const code = (sectionCode||'').trim();
  if (!txt) return '';
  const mid = path ? `${path}/` : '';
  return `page/${code}/${mid}${txt}.html`;
}

export function configureTables(){
  // URL 만들기 (모양/구조 변경 없음)
  document.querySelectorAll('.section').forEach(section=>{
    const code  = section.dataset.code || '';     // 섹션별 코드(data-code에 들어있음)
    const table = section.querySelector('table.grid');
    if (!table) return;
    [...table.tBodies[0].rows].forEach(tr=>{
      const tds = tr.cells;
      const pathCell = tds[4]; // 원본 테이블에서 path 열이 5번째
      const urlCell  = tds[5]; // URL 열이 6번째
      const a = urlCell?.querySelector('a');
      if (!a) return;
      const href = buildHref(code, pathCell?.textContent, a.textContent);
      if (href) {
        a.href = href;
        a.target = '_blank';
        a.title = '새창열림';
      }
    });
  });

  // 진행률 (row-muted/row-hold 제외, row-done/row-edit만 완료로 카운트)
  const rows = [...document.querySelectorAll('.js-count tbody tr')];
  const done  = rows.filter(tr => tr.classList.contains('row-done') || tr.classList.contains('row-edit')).length;
  const total = rows.filter(tr => !tr.classList.contains('row-muted') && !tr.classList.contains('row-hold')).length;
  const percent = total ? ((done/total)*100).toFixed(2) : '0.00';
  const set = (id,val)=>{ const n=document.getElementById(id); if(n) n.textContent = val; };
  set('done', done); set('total', total); set('percent', `${percent}%`);

  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}
