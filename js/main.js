
import { configureTables } from './app.table.js';
import { installHoverPreview, setPreviewEnabled } from './app.preview.js';

// title sync (no style change)
document.addEventListener('DOMContentLoaded', ()=>{
  const title = document.querySelector('title');
  const h = document.querySelector('.tit1');
  if (title && h && h.textContent.trim()) title.textContent = h.textContent.trim();
});

// toolbar: preview-only (열 병합 토글 제거 요구 반영)
document.addEventListener('DOMContentLoaded', ()=>{
  const btnPreview = document.getElementById('btnPreview');
  if (btnPreview){
    btnPreview.addEventListener('click', ()=>{
      const on = !btnPreview.classList.contains('is-on');
      setPreviewEnabled(on);
    });
  }
});

// run
document.addEventListener('DOMContentLoaded', ()=>{
  configureTables();
  installHoverPreview({ selector: '.pub_list tbody td:nth-child(6) a' });
});
