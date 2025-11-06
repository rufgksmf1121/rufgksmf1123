// Fixed-position hover preview (left-center)
// - Hover/Foucs: show preview
// - Leave/Blur/Scroll/Resize: hide
// - Click: goes to the link (iframe pointer-events:none)
//
// NEW: If <a data-preview-gif="...gif"> is present, the preview shows that GIF
//      (while click still goes to the original href). Otherwise it previews href as-is.

let _frame = null;
const _blobCache = new Map(); // gifUrl -> blobObjectURL

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

// Build a tiny HTML viewer to show a GIF nicely fitted in the preview box.
// We use a Blob URL so that any remote GIF (https) can be embedded safely.
function getGifViewerUrl(gifUrl){
  if (_blobCache.has(gifUrl)) return _blobCache.get(gifUrl);
  const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html,body{height:100%;margin:0;background:#fff}
  .wrap{display:flex;align-items:center;justify-content:center;height:100%}
  img{max-width:100%;max-height:100%;image-rendering:auto}
</style></head>
<body>
  <div class="wrap">
    <img src="${gifUrl}" alt="preview gif" />
  </div>
</body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  _blobCache.set(gifUrl, url);
  return url;
}

function showPreview(srcUrl, width, height, scale){
  if (!canPreview()) return;
  const f = ensureFrame(width, height, scale);
  if (f.src !== srcUrl) f.src = srcUrl;
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

      // NEW: data-preview-gif 우선
      const gif = a.getAttribute('data-preview-gif');
      const previewSrc = gif ? getGifViewerUrl(gif) : href;

      showPreview(previewSrc, width, height, scale);
    });
    a.addEventListener('focus', ()=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const gif = a.getAttribute('data-preview-gif');
      const previewSrc = gif ? getGifViewerUrl(gif) : href;

      showPreview(previewSrc, width, height, scale);
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
