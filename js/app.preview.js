export function installHoverPreview({ selector, width=1280, height=720, scale=0.85 }){
  // Single iframe reused
  let frame = null;
  function ensure(){
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.id = 'hoverPreview';
    frame.setAttribute('title','미리보기');
    // Fixed left-center placement (CSS kept out of stylesheet per request)
    Object.assign(frame.style, {
      position:'fixed',
      left:'16px',
      top:'50%',
      transform:'translateY(-50%)',
      width: width + 'px',
      height: height + 'px',
      border:'0',
      borderRadius:'12px',
      boxShadow:'0 8px 24px rgba(0,0,0,.25)',
      background:'#fff',
      zIndex:'9999',
      pointerEvents:'none', // preview doesn't intercept clicks
      display:'none'
    });
    document.body.appendChild(frame);
    return frame;
  }
  function show(href){
    const f = ensure();
    f.style.transform = 'translateY(-50%) scale(' + scale + ')';
    f.style.transformOrigin = 'top left';
    if (f.src !== href) f.src = href;
    f.style.display = 'block';
  }
  function hide(){
    if (!frame) return;
    frame.style.display = 'none';
    frame.removeAttribute('src'); // release
  }

  document.querySelectorAll(selector).forEach((a)=>{
    a.addEventListener('mouseenter', ()=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      show(href);
    });
    a.addEventListener('focus', ()=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      show(href);
    });
    a.addEventListener('mouseleave', hide);
    a.addEventListener('blur', hide);
  });

  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide, { passive: true });
  window.addEventListener('blur', hide);
}

// Preview ON/OFF switch
let __previewEnabled = true;
export function setPreviewEnabled(v){
  __previewEnabled = !!v;
  const f = document.getElementById('hoverPreview');
  if (!__previewEnabled && f) f.style.display = 'none';
}