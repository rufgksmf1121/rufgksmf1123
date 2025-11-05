// 툴바(버튼) 초기화
export function initToolbar({ onToggleMerge, onTogglePreview }) {
  const $btnMerge = document.getElementById('btnMerge');
  const $btnPreview = document.getElementById('btnPreview');

  // 상태 표시 헬퍼
  function setOn(btn, on) {
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('is-on', on);
  }

  // 초기 상태
  setOn($btnPreview, true);

  $btnMerge.addEventListener('click', () => {
    const pressed = $btnMerge.getAttribute('aria-pressed') === 'true';
    setOn($btnMerge, !pressed);
    onToggleMerge && onToggleMerge(!pressed);
  });

  $btnPreview.addEventListener('click', () => {
    const pressed = $btnPreview.getAttribute('aria-pressed') === 'true';
    setOn($btnPreview, !pressed);
    onTogglePreview && onTogglePreview(!pressed);
  });
}
