// js/app.preview.js
import { isPreviewEnabled } from './app.table.js?v=6';

export function installHoverPreview({ selector, width, height, scale, offsetX, offsetY }){
  document.querySelectorAll(selector).forEach(a=>{
    a.addEventListener('mouseenter', e=>{
      if(!isPreviewEnabled()) return;
      const f = ensure();
      f.width = String(width);
      f.height = String(height);
      f.style.transform = `scale(${scale})`;
      f.style.transformOrigin = 'top left';
      f.src = a.href;
      pos(f, e.pageX, e.pageY, {width,height,scale,offsetX,offsetY});
      f.hidden = false;
    });
    a.addEventListener('mousemove', e=>{
      const f = document.getElementById('hoverPreview');
      if(!f || f.hidden) return;
      pos(f, e.pageX, e.pageY, {width,height,scale,offsetX,offsetY});
    });
    a.addEventListener('mouseleave', ()=>{
      const f = document.getElementById('hoverPreview');
      if (f) f.hidden = true;
    });
  });
}

function ensure(){
  let f = document.getElementById('hoverPreview');
  if (f) return f;
  f = document.createElement('iframe');
  f.id = 'hoverPreview';
  f.className = 'preview';
  f.hidden = true;
  document.body.appendChild(f);
  return f;
}

function pos(f, x, y, opt){
  const {width,height,scale,offsetX,offsetY} = opt;
  const ww = innerWidth, wh = innerHeight;
  const fw = width * scale, fh = height * scale;

  let left = x + offsetX, top = y + offsetY;

  if (ww - (x - scrollX) < fw + offsetX * 2) left = x - fw - offsetX;
  if (wh - (y - scrollY) < fh + Math.abs(offsetY)) top = y - fh - Math.abs(offsetY);

  f.style.left = left + 'px';
  f.style.top  = top  + 'px';
}
