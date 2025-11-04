export function initToolbar({ onToggleMerge, onTogglePreview }) {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) return;
  const mergeBtn = toolbar.querySelector('[data-action="merge"]');
  const previewBtn = toolbar.querySelector('[data-action="preview"]');
  if (mergeBtn) mergeBtn.addEventListener('click', () => onToggleMerge());
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      const next = previewBtn.getAttribute('aria-pressed') !== 'true';
      previewBtn.setAttribute('aria-pressed', String(next));
      onTogglePreview(next);
    });
  }
}
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
