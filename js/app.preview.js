let previewOn = true;
export const isPreviewEnabled = () => previewOn;
export const setPreviewEnabled = v => { previewOn = !!v; };

function ensureFrame() {
  let f = document.getElementById('hoverPreview');
  if (f) return f;
  f = document.createElement('iframe');
  f.id = 'hoverPreview';
  f.style.position = 'fixed';
  f.style.left = '24px';
  f.style.top = '50%';
  f.style.transform = 'translateY(-50%)';
  f.style.width = '720px';
  f.style.height = '450px';
  f.style.border = '1px solid #e5e7eb';
  f.style.background = '#fff';
  f.style.boxShadow = '0 10px 30px rgba(0,0,0,.15)';
  f.style.zIndex = '9999';
  f.style.display = 'none';
  f.setAttribute('title','미리보기');
  document.body.appendChild(f);
  return f;
}

export function installHoverPreview({ selector }) {
  const anchors = document.querySelectorAll(selector);
  anchors.forEach(a => {
    a.addEventListener('mouseenter', e => {
      if (!previewOn) return;
      const f = ensureFrame();
      f.src = a.href;
      f.style.display = 'block';
    });
    a.addEventListener('mouseleave', () => {
      const f = document.getElementById('hoverPreview');
      if (f) f.style.display = 'none';
    });
    // 클릭 시 새창 이동
    a.setAttribute('target', '_blank');
    a.setAttribute('rel','noopener');
  });
}
