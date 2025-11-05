
import { toggleMerge, setPreviewEnabled } from './app.table.js';
export function initToolbar({ onToggleMerge, onTogglePreview }={}){
  const btnMerge = document.getElementById('btnMerge');
  const btnPreview = document.getElementById('btnPreview');
  if (btnMerge){
    btnMerge.addEventListener('click', ()=>{
      btnMerge.classList.toggle('is-on');
      onToggleMerge ? onToggleMerge() : toggleMerge();
    });
  }
  if (btnPreview){
    btnPreview.addEventListener('click', ()=>{
      const pressed = btnPreview.getAttribute('aria-pressed') === 'true' ? false : true;
      btnPreview.setAttribute('aria-pressed', String(pressed));
      btnPreview.classList.toggle('is-on', pressed);
      onTogglePreview ? onTogglePreview(pressed) : setPreviewEnabled(pressed);
    });
  }
}
