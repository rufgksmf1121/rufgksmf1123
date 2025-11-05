import { configureTables } from './app.table.js';
import { installHoverPreview, setPreviewEnabled, isPreviewEnabled } from './app.preview.js';

function setTitles(){
  // 문서 탭 제목
  document.title = 'AML Solution 작업 리스트';
  // 화면 내 제목 텍스트만 변경 (스타일/구조 손대지 않음)
  const h = document.querySelector('.page-title, h1, header h1');
  if (h) h.textContent = 'AML Solution 작업 리스트';
}

function movePreviewButton(){
  // 열병합 토글 제거 + 그 자리에 미리보기 버튼 이동
  const mergeBtn = document.getElementById('btnMergeToggle');
  const previewBtn = document.getElementById('btnPreview');
  if (!previewBtn) return;

  if (mergeBtn && mergeBtn.parentElement) {
    const parent = mergeBtn.parentElement;
    parent.replaceChild(previewBtn, mergeBtn);  // 같은 자리로 이동
  }
}

function bindPreviewButton(){
  const btn = document.getElementById('btnPreview');
  if (!btn) return;
  setPreviewEnabled(true);
  btn.addEventListener('click', ()=>{
    const on = !isPreviewEnabled();
    setPreviewEnabled(on);
    // 버튼 UI(색/크기/텍스트) 건드리지 말라 하셔서 표시 변경은 하지 않습니다.
    // 필요하면 아래 한줄만 쓰세요:
    // btn.textContent = on ? '미리보기 ON' : '미리보기 OFF';
  });
}

function initHover(){
  // URL 열 a 태그에만 설치 (원본 표 구조 기준 6번째 열이 URL)
  const selector = 'table.grid tbody td:nth-child(6) a';
  installHoverPreview({ selector });

  document.addEventListener('tables:rebuilt', ()=>{
    installHoverPreview({ selector });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  setTitles();
  movePreviewButton();
  bindPreviewButton();
  configureTables();
  initHover();
});
