import { isPreviewEnabled } from './app.table.js';
export function installHoverPreview({ selector, width, height, scale, offsetX, offsetY }){
  const cache = new Map();
  async function exists(href){
    if (cache.has(href)) return cache.get(href);
    const p = fetch(href, { method:'HEAD' }).then(res => res.ok).catch(()=>false);
    cache.set(href, p); return p;
  }
  function ensure(){ let f=document.getElementById('hoverPreview'); if(f) return f; f=document.createElement('iframe'); f.id='hoverPreview'; f.className='preview'; f.hidden=true; document.body.appendChild(f); return f; }
  function hide(){ const f=document.getElementById('hoverPreview'); if(f) f.hidden=true; }
  function position(f){  const fw = width * scale, fh = height * scale;  f.style.position = 'fixed';  f.style.left = '20px';  f.style.top = '50%';  f.style.transform = `translateY(-50%) scale(${scale})`;  f.style.transformOrigin = 'top left';}

  document.querySelectorAll(selector).forEach(a=>{
    a.addEventListener('mouseenter', async (e)=>{  if (!isPreviewEnabled()) return;  const href = a.getAttribute('href'); if(!href || !(await exists(href))) return;  const f = ensure(); f.width=String(width); f.height=String(height);  f.src=href; position(f); f.hidden=false;});
    a.addEventListener('mousemove', (e)=>{ /* fixed preview: no cursor tracking */ });
    a.addEventListener('mouseleave', hide);
  });
  window.addEventListener('scroll', hide,{passive:true}); window.addEventListener('wheel', hide,{passive:true}); window.addEventListener('blur', hide);
}