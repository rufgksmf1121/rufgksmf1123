
// app.preview.js — hover preview ON/OFF
let previewEnabled = true;

export const isPreviewEnabled = () => previewEnabled;
export const setPreviewEnabled = (v)=>{
  previewEnabled = !!v;
  const btn = document.getElementById('btnPreview');
  if (btn){
    btn.classList.toggle('is-on', previewEnabled);
    btn.textContent = previewEnabled ? '미리보기 ON' : '미리보기 OFF';
  }
  // hide frame when OFF
  const f = document.getElementById('hoverPreview');
  if (f) f.hidden = !previewEnabled;
};

export function installHoverPreview(opt={}){
  const cfg = Object.assign({
    selector: '.js-pub a',
    width: 1440, height: 720, scale: 0.85,
    offsetX: 50, offsetY: -100
  }, opt);

  function ensure(){
    let f = document.getElementById('hoverPreview');
    if (f) return f;
    f = document.createElement('iframe');
    f.id = 'hoverPreview';
    f.className = 'preview';
    f.style.cssText = [
      'position:fixed','left:16px','top:50%','transform-origin:top left',
      'z-index:9999','box-shadow:0 8px 24px rgba(0,0,0,.2)',
      'border:1px solid #e5e7eb','background:#fff'
    ].join(';');
    document.body.appendChild(f);
    return f;
  }

  function applyFrameFrame(f, e){
    const w = cfg.width, h = cfg.height, s = cfg.scale;
    f.width = String(w);
    f.height = String(h);
    f.style.transform = `scale(${s})`;
    // center vertically to the left
    const top = Math.round(window.innerHeight/2 - (h*s)/2);
    f.style.top = top + 'px';
  }

  function mouseenter(e){
    if (!previewEnabled) return;
    const a = e.currentTarget;
    const href = a.getAttribute('href');
    if (!href) return;
    const f = ensure();
    f.hidden = false;
    if (f.src !== href) f.src = href;
    applyFrameFrame(f, e);
  }
  function mouseleave(){
    const f = document.getElementById('hoverPreview');
    if (!f) return;
    f.hidden = true;
  }

  const bind = ()=>{
    document.querySelectorAll(cfg.selector).forEach(a=>{
      a.removeEventListener('mouseenter', mouseenter);
      a.removeEventListener('mouseleave', mouseleave);
      a.addEventListener('mouseenter', mouseenter);
      a.addEventListener('mouseleave', mouseleave);
    });
  };

  bind();
  document.addEventListener('tables:rebuilt', bind);
}
