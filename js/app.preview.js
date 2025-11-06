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

function ensureFrame(){
  if (_frame && document.body.contains(_frame)) return _frame;
  const f = document.createElement('iframe');
  f.setAttribute('title','미리보기');
  Object.assign(f.style, {
    position:'fixed',
    left:'24px',
    top:'50%',
    transform:'translateY(-50%)',
    width:'520px',
    height:'360px',
    border:'1px solid rgba(148,163,184,.35)',
    borderRadius:'12px',
    boxShadow:'0 10px 30px rgba(0,0,0,.25)',
    background:'#000',
    zIndex:'2147483000',
    display:'none',
    pointerEvents:'none' // hover만으로 제어
  });
  document.body.appendChild(f);
  _frame = f;
  return f;
}

const canPreview = () => window.__previewEnabled !== false;
const abs = (u) => new URL(u, document.baseURI).href;

// ----- Viewer Builders -------------------------------------------------------

function buildGifViewerUrl(gifUrl, fitMode='cover'){
  const urlAbs = abs(gifUrl);
  const key = `gif:${urlAbs}:${fitMode}`;
  if (_blobCache.has(key)) return _blobCache.get(key);

  // Modes:
  // - sharp (default): foreground GIF at natural size (no upscaling), blurred background fills screen
  // - contain: fit inside viewport (may upscale/downscale)
  // - cover: fill viewport (may crop and upscale)
  const isCover = fitMode === 'cover';
  const isContain = fitMode === 'contain';
  const useSharp = !isCover && !isContain;

  const fitCss = isCover ? 'object-fit:cover;width:100%;height:100%;' :
                  isContain ? 'object-fit:contain;width:100%;height:100%;' :
                  // sharp
                  'object-fit:contain;max-width:100%;max-height:100%;height:auto;width:auto;';

  const bgLayer = useSharp ? `
    .bg{
      position:absolute;inset:0;
      background:url('${urlAbs}') center/cover no-repeat;
      filter:blur(24px) brightness(0.9);
      transform:scale(1.1);
    }` : '';

  
const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{height:100%;margin:0;background:#000;overflow:hidden}
  .wrap{position:relative;display:flex;align-items:center;justify-content:center;height:100%}
  img{
    width:100%;height:100%;
    object-fit:cover; /* 프레임 꽉 채움 (일부 크롭 가능) */
    image-rendering:auto;
    image-rendering:-webkit-optimize-contrast;
    -ms-interpolation-mode: bicubic;
    backface-visibility:hidden;
    will-change:transform;
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

function showPreview(srcUrl, w, h){
  if (!canPreview()) return;
  const f = ensureFrame();
  if (w && h) {
    f.style.width  = (typeof w==='number'? w+'px' : w);
    f.style.height = (typeof h==='number'? h+'px' : h);
  }
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
  // width/height/scale는 더 이상 사용하지 않음 (풀스크린 고정)

  document.querySelectorAll(selector).forEach((a)=>{
    const getPreviewParams = ()=>{
      // fit 모드 결정 (기본: contain)
      const fit = (a.getAttribute('data-preview-fit') || 'contain').toLowerCase();

      const html = a.getAttribute('data-preview-html');
      if (html) return {src:abs(html)};

      const gif = a.getAttribute('data-preview-gif');
      if (gif) return {src:buildGifViewerUrl(gif, fit)};

      const video = a.getAttribute('data-preview-video');
      if (video) return {src:buildVideoViewerUrl(video, fit)};

      const href = a.getAttribute('href');
      return href && href !== '#' ? abs(href) : null;
    };

    a.addEventListener('mouseenter', ()=>{ const p = getPreviewParams(); if (p&&p.src){ const w=a.getAttribute('data-preview-width')||'520px'; const h=a.getAttribute('data-preview-height')||'360px'; showPreview(p.src,w,h);} });
    a.addEventListener('focus',     ()=>{ const p = getPreviewParams(); if (p&&p.src){ const w=a.getAttribute('data-preview-width')||'520px'; const h=a.getAttribute('data-preview-height')||'360px'; showPreview(p.src,w,h);} });
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
