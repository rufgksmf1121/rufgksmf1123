// Fixed-position hover preview (left-center)
// - Hover/Focus: show preview
// - Leave/Blur/Scroll/Resize: hide
// - Click: goes to link (iframe pointer-events:none)
//
// Supports:
//   <a data-preview-gif="...gif">     → GIF preview
//   <a data-preview-video="...mp4">   → Video preview (autoplay, muted, loop, playsinline)
//
// Toggle: window.__previewEnabled (true by default)

let _frame = null;
const _blobCache = new Map(); // key -> blobURL

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

function canPreview(){ return window.__previewEnabled !== false; }

function buildGifViewerUrl(gifUrl){
  const key = `gif:${gifUrl}`;
  if (_blobCache.has(key)) return _blobCache.get(key);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{height:100%;margin:0;background:#fff}.wrap{display:flex;align-items:center;justify-content:center;height:100%}img{max-width:100%;max-height:100%}</style>
</head><body><div class="wrap"><img src="${gifUrl}" alt="preview gif"/></div></body></html>`;
  const url = URL.createObjectURL(new Blob([html], {type:'text/html'}));
  _blobCache.set(key, url);
  return url;
}

function buildVideoViewerUrl(videoUrl){
  const key = `vid:${videoUrl}`;
  if (_blobCache.has(key)) return _blobCache.get(key);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{height:100%;margin:0;background:#000}.wrap{display:flex;align-items:center;justify-content:center;height:100%}video{max-width:100%;max-height:100%}</style>
</head><body><div class="wrap"><video src="${videoUrl}" autoplay muted loop playsinline controlslist="nodownload noplaybackrate" controls onloadeddata="this.play().catch(()=>{})"></video></div></body></html>`;
  const url = URL.createObjectURL(new Blob([html], {type:'text/html'}));
  _blobCache.set(key, url);
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
    const getPreviewSrc = ()=>{
      const video = a.getAttribute('data-preview-video');
      if (video) return buildVideoViewerUrl(video);
      const gif = a.getAttribute('data-preview-gif');
      if (gif) return buildGifViewerUrl(gif);
      const href = a.getAttribute('href');
      return href && href !== '#' ? href : null;
    };
    a.addEventListener('mouseenter', ()=>{
      const src = getPreviewSrc(); if (!src) return;
      showPreview(src, width, height, scale);
    });
    a.addEventListener('focus', ()=>{
      const src = getPreviewSrc(); if (!src) return;
      showPreview(src, width, height, scale);
    });
    a.addEventListener('mouseleave', hidePreview);
    a.addEventListener('blur', hidePreview);
  });
  window.addEventListener('scroll', hidePreview, { passive:true });
  window.addEventListener('resize', hidePreview, { passive:true });
  window.addEventListener('blur', hidePreview);
}

export function setPreviewEnabled(v){
  window.__previewEnabled = !!v;
  if (!v) hidePreview();
}