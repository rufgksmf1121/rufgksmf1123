export function installHoverPreview({ selector, width, height, scale, offsetX, offsetY }){
  const cache = new Map();
  async function exists(href){
    if (cache.has(href)) return cache.get(href);
    const p = fetch(href, { method:'HEAD' }).then(res => res.ok).catch(()=>false);
    cache.set(href, p); return p;
  }
  function ensure(){ let f=document.getElementById('hoverPreview'); if(f) return f; f=document.createElement('iframe'); f.id='hoverPreview'; f.className='preview'; f.hidden=true; document.body.appendChild(f); return f; }
  function hide(){ const f=document.getElementById('hoverPreview'); if(f) f.hidden=true; }
  function position(f,x,y){ const fw=width*scale,fh=height*scale; let left=x+offsetX, top=y+offsetY; if(innerWidth-(x-scrollX)<fw+offsetX*2) left=x-fw-offsetX; if(innerHeight-(y-scrollY)<fh+Math.abs(offsetY)) top=y-fh-Math.abs(offsetY); f.style.left=left+'px'; f.style.top=top+'px'; }

  document.querySelectorAll(selector).forEach(a=>{
    a.addEventListener('mouseenter', async (e)=>{
      const href = a.getAttribute('href'); if(!href || !(await exists(href))) return;
      const f = ensure(); f.width=String(width); f.height=String(height);
      f.style.transform=`scale(${scale})`; f.style.transformOrigin='top left';
      f.src=href; position(f, e.pageX, e.pageY); f.hidden=false;
    });
    a.addEventListener('mousemove', (e)=>{ const f=document.getElementById('hoverPreview'); if(!f||f.hidden) return; position(f,e.pageX,e.pageY); });
    a.addEventListener('mouseleave', hide);
  });
  window.addEventListener('scroll', hide,{passive:true}); window.addEventListener('wheel', hide,{passive:true}); window.addEventListener('blur', hide);
}