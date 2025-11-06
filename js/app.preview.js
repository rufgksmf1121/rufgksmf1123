// Fixed-position hover preview (left-center)
// Shows on hover/focus, hides on leave/blur/scroll/resize/blur.
// Click goes through to the link (iframe is pointer-events:none).

let _frame = null;
function ensureFrame(width=1280, height=720, scale=0.85){
  if (_frame) return _frame;
  const f = document.createElement('iframe');
  f.id = 'hoverPreview';
  f.setAttribute('title','미리보기');
  Object.assign(f.style, {
    position:'fixed',
    left:'16px',
    top:'50%',
    transform:`translateY(-50%) scale(${scale})`,
    transformOrigin:'top left',
    width: width + 'px',
    height: height + 'px',
    border:'0',
    borderRadius:'12px',
    boxShadow:'0 8px 24px rgba(0,0,0,.25)',
    background:'#fff',
    zIndex:'9999',
    pointerEvents:'none',
    display:'none'
  });
  document.body.appendChild(f);
  _frame = f;
  return _frame;
}

function canPreview(){
  // Default ON; turned off when external toggle sets window.__previewEnabled=false
  return window.__previewEnabled !== false;
}

function showPreview(href, width, height, scale){
  if (!canPreview()) return;
  const f = ensureFrame(width, height, scale);
  if (f.src !== href) f.src = href;
  f.style.display = 'block';
}
function hidePreview(){
  if (!_frame) return;
  _frame.style.display = 'none';
  _frame.removeAttribute('src');
}

export function installHoverPreview({ selector, width=1280, height=720, scale=0.85 } = {}){
  document.querySelectorAll(selector).forEach((a)=>{
    a.addEventListener('mouseenter', ()=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      showPreview(href, width, height, scale);
    });
    a.addEventListener('focus', ()=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      showPreview(href, width, height, scale);
    });
    a.addEventListener('mouseleave', hidePreview);
    a.addEventListener('blur', hidePreview);
  });
  window.addEventListener('scroll', hidePreview, { passive:true });
  window.addEventListener('resize', hidePreview, { passive:true });
  window.addEventListener('blur', hidePreview);
}

// External control (proxy through window)
export function setPreviewEnabled(v){
  window.__previewEnabled = !!v;
  if (!v) hidePreview();
}
