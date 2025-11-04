// app.common.js : 공통 UI 제어 (김영한 스타일)
/**
 * 단일 책임: 툴바 버튼과 상호작용을 초기화하고 콜백만 호출한다.
 * 의도 드러나는 이름, 가드절, 매직넘버 제거.
 */
export function initToolbar({ onToggleMerge, onTogglePreview }) {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;

  const mergeBtn = toolbar.querySelector('[data-action="merge"]');
  const previewBtn = toolbar.querySelector('[data-action="preview"]');

  if (mergeBtn) {
    mergeBtn.addEventListener('click', () => onToggleMerge());
  }
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      const next = previewBtn.getAttribute('aria-pressed') !== 'true';
      previewBtn.setAttribute('aria-pressed', String(next));
      onTogglePreview(next);
    });
  }
}

// 사이드 내비 현재 섹션 강조
export function initSideNav() {
  const nav = document.getElementById('sideNav');
  if (!nav) return;
  const items = Array.from(nav.querySelectorAll('a'));
  const mark = () => {
    const hash = location.hash || '#s-common';
    items.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  };
  window.addEventListener('hashchange', mark);
  if (!location.hash) history.replaceState(null, '', '#s-common');
  mark();
}
