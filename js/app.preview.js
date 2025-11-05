// 링크 hover 미리보기(iframe)
// enabled=false면 아무 것도 안 함.
export function installHoverPreview({ selector, width, height, scale, offsetX, offsetY, enabled }){
  let on = !!enabled;
  const panel = document.getElementById('hoverPreview');
  const frame = document.getElementById('hoverFrame');

  function showAt(x,y){
    panel.style.left = (x + offsetX) + 'px';
    panel.style.top  = (y + offsetY) + 'px';
    panel.classList.add('show');
  }
  function hide(){ panel.classList.remove('show'); frame.removeAttribute('src'); }

  function canLoad(url){
    // HEAD 로 200인지 대충만 확인 (GH Pages는 CORS OK)
    return fetch(url, { method:'HEAD' }).then(r=>r.ok).catch(()=>false);
  }

  function attach(){
    document.querySelectorAll(selector).forEach(a=>{
      a.addEventListener('mouseenter', async (e)=>{
        if(!on) return;
        const href = a.getAttribute('href'); if(!href) return;
        const ok = await canLoad(href); if(!ok) return;
        frame.src = href;
        showAt(e.clientX, e.clientY);
      });
      a.addEventListener('mousemove', (e)=>{ if(panel.classList.contains('show')) showAt(e.clientX, e.clientY); });
      a.addEventListener('mouseleave', hide);
      a.addEventListener('click', ()=> hide());
    });
  }
  attach();

  // 툴바 토글과 연동
  document.addEventListener('preview:toggle', (ev)=>{
    on = !!ev.detail;
    if(!on) hide();
  });
}
