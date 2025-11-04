// js/app.table.js v9

let previewEnabled = true;
export const isPreviewEnabled = () => previewEnabled;
export const setPreviewEnabled = (v) => (previewEnabled = !!v);

// 섹션 코드 + path + URL 텍스트로 실제 href 생성
function buildHref(sectionCode, pathText, urlText){
  const txt = (urlText || '').trim();
  const path = (pathText || '').trim();
  const code = (sectionCode || '').trim();

  // 공통(코드 없음)
  if (!code) {
    // 예: ../../guide → 루트 상대 경로 그대로
    if (path === '../../') return `${path}${txt}.html`;
    return `page/${path}/${txt}.html`;
  }
  // 일반 섹션
  const mid = path ? `${path}/` : '';
  return `page/${code}/${mid}${txt}.html`;
}

// 표 전체 구성 + 링크 주입 + 상태/진행률
export function configureTables(){
  document.querySelectorAll('.section').forEach(section=>{
    const code = section.dataset.code || '';
    const table = section.querySelector('table.grid');
    if (!table) return;

    // 각 행의 링크 생성
    [...table.tBodies[0].rows].forEach(tr=>{
      const tds = tr.cells;
      const pathCell = tds[4];
      const urlCell  = tds[5];
      const a = urlCell?.querySelector('a');
      if (!a) return;

      const href = buildHref(code, pathCell?.textContent, a.textContent);
      a.setAttribute('href', href);
      a.setAttribute('target','_blank');
      a.setAttribute('title','새창열림');
    });
  });

  // 진행률 계산(완료/수정만 집계)
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

  // 커스텀 이벤트(프리뷰 재바인딩 용)
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

// 열 병합 토글(2~4열 기준으로 연속값 병합)
export function toggleMerge(){
  const targets = document.querySelectorAll('table.grid');
  targets.forEach(tbl => {
    const on = tbl.getAttribute('data-merge') === 'on';
    tbl.setAttribute('data-merge', on ? 'off' : 'on');

    if (on) {
      // 해제: 모든 셀 복구(간단히 재렌더)
      configureTables();
      return;
    }
    // 병합 실행
    mergeColumn(tbl, 1); // 2Depth
    mergeColumn(tbl, 2); // 3Depth
    mergeColumn(tbl, 3); // 화면명
  });
  document.dispatchEvent(new CustomEvent('tables:rebuilt'));
}

function mergeColumn(tbl, colIndex){
  let prev = null, span = 1;
  [...tbl.tBodies[0].rows].forEach((tr, idx, arr)=>{
    const td = tr.cells[colIndex];
    if (!td) return;

    const txt = td.textContent.trim();
    if (prev && prev.text === txt && txt !== '') {
      span++;
      td.remove();
      prev.td.rowSpan = span;
    } else {
      prev = { text: txt, td };
      span = 1;
    }
  });
}

// 사이드바 앵커 활성화(부드러운 스크롤은 CSS로 처리)
export function initSideNav(){
  const nav = document.getElementById('sideNav');
  if (!nav) return;

  nav.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior:'smooth', block:'start' });
    history.replaceState(null,'',a.getAttribute('href'));
    setActive(a);
  });

  const setActive = (aEl)=>{
    [...nav.querySelectorAll('a')].forEach(x=>x.classList.remove('active'));
    aEl.classList.add('active');
  };

  // 스크롤에 따른 현재 섹션 하이라이트
  const sections = [...document.querySelectorAll('.section[id]')];
  const io = new IntersectionObserver((entries)=>{
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b)=>a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    const link = nav.querySelector(`a[href="#${visible.target.id}"]`);
    if (link) setActive(link);
  }, { rootMargin:'-40% 0px -50% 0px', threshold:[0,1] });
  sections.forEach(s=>io.observe(s));
}
