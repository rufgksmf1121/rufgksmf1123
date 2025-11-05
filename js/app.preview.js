
// app.preview.js — hover preview (left / centered)
let frame;
export function installHoverPreview({ selector, width=1440, height=720, scale=.85, offsetX=50, offsetY=-100 }){
  const ensure = ()=>{
    if (frame) return;
    frame = document.createElement('iframe');
    frame.id = 'hoverPreview';
    frame.style.cssText = `position:fixed;left:${offsetX}px;top:80px;
      width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:top left;
      border:1px solid #ddd;border-radius:8px;background:#fff;z-index:9999;display:none;
      box-shadow:0 10px 24px rgba(0,0,0,.12)`;
    document.body.appendChild(frame);
  };
  ensure();

  document.addEventListener('mouseover', (e)=>{
    const a = e.target.closest(selector); if (!a) return;
    if (!a.href) return;
    frame.src = a.href;
    frame.style.display = 'block';
  }, true);

  document.addEventListener('mousemove', (e)=>{
    if (!frame || frame.style.display === 'none') return;
    const top = window.scrollY + 80 + (Math.min(0, e.clientY-200));
    frame.style.top = top + 'px';
  }, true);

  document.addEventListener('mouseout', (e)=>{
    const a = e.target.closest(selector);
    if (a) { frame.style.display = 'none'; }
  }, true);

  // tables rebuild 시 다시 보정 위해 이벤트 훅만 연결
}
