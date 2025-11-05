
import { isPreviewEnabled } from './app.table.js';
export function installHoverPreview({ selector, width=1440, height=720, scale=0.85, offsetX=50, offsetY=-100 }){
  const anchors = document.querySelectorAll(selector);
  anchors.forEach(a=>{
    a.addEventListener('mouseenter', (e)=>ensure(e));
    a.addEventListener('mousemove', (e)=>ensure(e));
    a.addEventListener('mouseleave', hide);
  });
  function ensure(e){
    if (!isPreviewEnabled()) return;
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    let f = document.getElementById('hoverPreview');
    if (!f){
      f = document.createElement('iframe');
      f.id = 'hoverPreview';
      f.className = 'preview';
      f.style.position = 'fixed';
      f.style.zIndex = '999';
      f.style.border = '1px solid #e1e1e1';
      f.style.boxShadow = '0 8px 20px rgba(0,0,0,.12)';
      document.body.appendChild(f);
    }
    f.hidden = false;
    f.width = String(width);
    f.height = String(height);
    f.style.transform = `scale(${scale})`;
    f.style.transformOrigin = 'top left';
    if (f.src !== href) f.src = href;
    position(e, f);
  }
  function position(e, f){
    const w = innerWidth, h = innerHeight;
    const fw = width * scale, fh = height * scale;
    let left = e.pageX + offsetX, top = e.pageY + offsetY;
    if (left + fw > w) left = Math.max(0, w - fw - 8);
    if (top + fh > h) top = Math.max(0, h - fh - 8);
    f.style.left = left + 'px';
    f.style.top = top + 'px';
  }
  function hide(){
    const f = document.getElementById('hoverPreview');
    if (f) f.hidden = true;
  }
}
