
// js/app.preview.js
import { isPreviewEnabled } from './app.table.js';

export function installHoverPreview({ selector, width=1440, height=720, scale=0.85, offsetX=50, offsetY=-100 }){
  const anchors = document.querySelectorAll(selector);
  anchors.forEach(a=>{
    a.addEventListener('mouseenter', ensure);
    a.addEventListener('mousemove', ensure);
    a.addEventListener('mouseleave', hide);
  });

  function ensure(e){
    if (!isPreviewEnabled()) { hide(); return; }
    const f = getFrame();
    const { pageX, pageY } = e;
    const fw = width * scale, fh = height * scale;
    f.style.width = fw + 'px';
    f.style.height = fh + 'px';
    f.style.transformOrigin = 'top left';
    f.style.transform = `scale(${scale})`;
    const left = pageX + offsetX;
    const top  = pageY + offsetY;
    f.style.left = left + 'px';
    f.style.top  = top  + 'px';
    const href = e.currentTarget.getAttribute('href');
    if (href && f.src !== href) f.src = href;
    f.hidden = false;
  }
  function hide(){
    const f = document.getElementById('hoverPreview');
    if (f) f.hidden = true;
  }
  function getFrame(){
    let f = document.getElementById('hoverPreview');
    if (!f){
      f = document.createElement('iframe');
      f.id = 'hoverPreview';
      f.className = 'preview';
      f.style.position = 'absolute';
      f.style.border = '1px solid #ddd';
      f.style.background = '#fff';
      f.style.zIndex = '999';
      f.hidden = true;
      document.body.appendChild(f);
    }
    return f;
  }
}
