// js/app.common.js v9

// 툴바(토글 버튼) 초기화
export function initToolbar({ onToggleMerge, onTogglePreview }){
  const wrap = document.querySelector('.toolbar');
  if (!wrap) return;

  const mergeBtn   = wrap.querySelector('[data-action="merge"]');
  const previewBtn = wrap.querySelector('[data-action="preview"]');

  mergeBtn?.addEventListener('click', () => {
    onToggleMerge?.();
  });

  previewBtn?.addEventListener('click', () => {
    const pressed = previewBtn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true';
    previewBtn.setAttribute('aria-pressed', pressed);
    onTogglePreview?.(pressed === 'true');
  });
}
