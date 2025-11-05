// 링크 자동 구성, 진행률, 열 병합, 사이드바 스크롤/하이라이트

// sectionCode + path + url 로 최종 href 생성
function buildHref(section, path, url) {
  const clean = (s) => (s || '').trim().replace(/^\/*|\/*$/g, '');
  const p = clean(path);
  const u = clean(url);

  // 공통 테이블에서 ../../ 로 시작하는 가이드는 절대경로로 처리
  if (u.startsWith('guide')) return `page/guide.html`;

  if (section === 'COMMON') {
    // 예: CM/sample/_popup.html or CM/util/px_converter.html
    return `page/${p}/${u}.html`;
  }
  // 메인/STD/LAW/INT/OBL/CMP/APR
  return `page/${section}/${p ? p + '/' : ''}${u}.html`;
}

function text(td){ return (td?.textContent || '').trim(); }

export function initTables(){
  const tables = [...document.querySelectorAll('table.pub-table')];

  // URL 자동 붙이기 + 진행률 집계
  let total=0, done=0;
  for(const table of tables){
    const section = table.getAttribute('data-section') || 'COMMON';
    for(const tr of table.tBodies[0].rows){
      total++;
      const path = text(tr.cells[4]);
      const url  = text(tr.cells[5]);
      const a    = tr.cells[5]?.querySelector('a.js-url');
      if(a){
        const href = buildHref(section, path, url);
        a.setAttribute('href', href);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener');
      }
      // 상태 칸이 "완료/수정" 이면 done
      const state = text(tr.cells[7]);
      if(state.includes('완료') || state.includes('수정')) done++;
    }
  }
  // 진행률 표시
  const $t=document.getElementById('total'),$d=document.getElementById('done'),$p=document.getElementById('percent');
  if($t&&$d&&$p){ $t.textContent=String(total); $d.textContent=String(done); $p.textContent=((done/Math.max(1,total))*100).toFixed(2)+'%'; }

  // 열 병합 토글
  let merged=false;
  function mergeOnce(col){
    let prev='',span=1,first=null;
    for(const table of tables){
      for(const tr of [...table.tBodies[0].rows]){
        const td=tr.cells[col]; if(!td) continue;
        const cur=text(td);
        if(cur && cur===prev){ span++; td.remove(); first.setAttribute('rowspan',span); }
        else{ prev=cur; span=1; first=td; }
      }
      // 테이블 바뀌면 리셋
      prev=''; span=1; first=null;
    }
  }
  function clearMerge(){
    // 가장 쉬운 방법: 페이지 새로 그리지 않고도, merge를 다시 만들 수 있게
    // 최초 상태(모든 셀 존재)로 유지했기 때문에 아무 것도 안 함.
    // 실제 병합은 remove()로 셀을 없앴으므로, 토글 해제 시에는 페이지 리로드가 가장 안정적.
    location.reload();
  }

  document.addEventListener('merge:toggle', ()=>{
    if(!merged){ mergeOnce(1); mergeOnce(2); mergeOnce(3); merged=true; }
    else{ clearMerge(); }
  });
}

// 사이드바 스크롤/하이라이트
export function initSideNav(){
  const nav = document.getElementById('sideNav');
  const links = [...nav.querySelectorAll('a[data-target]')];
  const sections = links.map(a => document.getElementById(a.dataset.target));

  // 클릭 스크롤 보정
  links.forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - (64+12);
      window.scrollTo({ top, behavior:'smooth' });
    });
  });

  // 보이는 섹션 활성화
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(ent=>{
      const id = ent.target.id;
      const link = links.find(a=>a.dataset.target===id);
      if(ent.isIntersecting){
        links.forEach(l=>l.classList.toggle('active', l===link));
      }
    });
  }, { rootMargin: `-${64+14}px 0px -60% 0px`, threshold: 0.1 });

  sections.forEach(sec=>sec && io.observe(sec));
}
