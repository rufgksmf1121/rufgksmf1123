// Fullscreen Hover Preview (left-center → fullscreen)
// - 프레임: 화면 가득 100vw × 100vh (오버레이)
// - 콘텐츠: 기본 contain(여백 있을 수 있음, 선명도 유지). cover로 바꾸려면 옵션.
// - data-preview-html / data-preview-gif / data-preview-video 모두 지원
//
// 사용 예:
//   <a ... data-preview-gif="./assets/preview/good-morning.gif">
//   <a ... data-preview-video="./assets/preview/demo.mp4">
//   <a ... data-preview-html="./assets/preview/embed.html">
//   (선택) <a ... data-preview-fit="cover">  // 꽉 채우기 (일부 잘림 허용)
// 토글: window.__previewEnabled (true by default)

let _frame = null;
const _blobCache = new Map();
let _config = { width: 1280, height: 720, scale: 1, left: 24, top: null };

function ensureFrame(){
  if (_frame) return _frame;
  const f = document.createElement('iframe');
  f.id = 'hoverPreview';
  f.setAttribute('title','미리보기');
  const w = Math.round(_config.width * (_config.scale || 1));
  const h = Math.round(_config.height * (_config.scale || 1));
  const left = (_config.left != null ? _config.left : 24);
  const top = (_config.top != null ? _config.top : Math.max(24, Math.round((window.innerHeight - h)/2)));
  Object.assign(f.style, {
    position: 'fixed',
    left: left + 'px',
    top: top + 'px',
    width: w + 'px',
    height: h + 'px',
    border: '0',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,.25)',
    background: '#000',
    zIndex: '9999',
    pointerEvents: 'none',
    display: 'none'
  });
  document.body.appendChild(f);
  _frame = f;
  return _frame;
}
const canPreview = () => window.__previewEnabled !== false;
const abs = (u) => new URL(u, document.baseURI).href;

// ----- Viewer Builders -------------------------------------------------------

function buildGifViewerUrl(gifUrl, fitMode='contain'){
  const urlAbs = abs(gifUrl);
  const key = `gif:${urlAbs}:${fitMode}`;
  if (_blobCache.has(key)) return _blobCache.get(key);

  // contain: 화면 안에 전부 보이게 (여백 가능, 화질 유지)
  // cover: 화면을 가득 채우게 (잘림 가능)
  const fitCss = fitMode === 'cover' ? 'object-fit:cover;' : 'object-fit:contain;';

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#000}
  .wrap{display:flex;align-items:center;justify-content:center;height:100%}
  img{
    max-width:100%;max-height:100%;
    width:100%;height:100%;
    ${fitCss}
    image-rendering:auto; /* 부드럽게 보이도록 */
  }
</style></head>
<body>
  <div class="wrap">
    <img src="${urlAbs}" alt="preview gif"/>
  </div>
</body></html>`;
  const out = URL.createObjectURL(new Blob([html], {type:'text/html'}));
  _blobCache.set(key, out);
  return out;
}

function buildVideoViewerUrl(videoUrl, fitMode='contain'){
  const urlAbs = abs(videoUrl);
  const key = `vid:${urlAbs}:${fitMode}`;
  if (_blobCache.has(key)) return _blobCache.get(key);

  const fitCss = fitMode === 'cover' ? 'object-fit:cover;' : 'object-fit:contain;';

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#000}
  .wrap{display:flex;align-items:center;justify-content:center;height:100%}
  video{
    max-width:100%;max-height:100%;
    width:100%;height:100%;
    ${fitCss}
  }
</style></head>
<body>
  <div class="wrap">
    <video src="${urlAbs}" autoplay muted loop playsinline controlslist="nodownload noplaybackrate" controls
      onloadeddata="this.play().catch(()=>{})"></video>
  </div>
</body></html>`;
  const out = URL.createObjectURL(new Blob([html], {type:'text/html'}));
  _blobCache.set(key, out);
  return out;
}

// ----- Show / Hide -----------------------------------------------------------

function showPreview(srcUrl){
  if (!canPreview()) return;
  const f = ensureFrame();
  if (f.src !== srcUrl) f.src = srcUrl;
  f.style.display = 'block';
}
function hidePreview(){
  if (!_frame) return;
  _frame.style.display = 'none';
  _frame.removeAttribute('src');
}

// ----- Public API ------------------------------------------------------------

export function installHoverPreview({ selector, width, height, scale } = {}){
  // 미리보기 프레임: 전달된 width/height/scale 사용 (기본 1280×720)
  if (width)  _config.width = width;
  if (height) _config.height = height;
  if (scale)  _config.scale = scale;

  document.querySelectorAll(selector).forEach((a)=>{
    const getPreviewSrc = ()=>{
      // fit 모드 결정 (기본: contain)
      const fit = (a.getAttribute('data-preview-fit') || 'contain').toLowerCase();

      const html = a.getAttribute('data-preview-html');
      if (html) return abs(html);

      const gif = a.getAttribute('data-preview-gif');
      if (gif) return buildGifViewerUrl(gif, fit);

      const video = a.getAttribute('data-preview-video');
      if (video) return buildVideoViewerUrl(video, fit);

      const href = a.getAttribute('href');
      return href && href !== '#' ? abs(href) : null;
    };

    a.addEventListener('mouseenter', ()=>{ const s = getPreviewSrc(); if (s) showPreview(s); });
    a.addEventListener('focus',     ()=>{ const s = getPreviewSrc(); if (s) showPreview(s); });
    a.addEventListener('mouseleave', hidePreview);
    a.addEventListener('blur',      hidePreview);
  });

  window.addEventListener('scroll', hidePreview, { passive:true });
  window.addEventListener('resize', hidePreview, { passive:true });
  window.addEventListener('blur',   hidePreview);
}

export function setPreviewEnabled(v){
  window.__previewEnabled = !!v;
  if (!v) hidePreview();
}
