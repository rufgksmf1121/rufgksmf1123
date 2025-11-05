
// js/app.common.js
import { toggleMerge, setPreviewEnabled } from './app.table.js';

export function initToolbar({ onToggleMerge, onTogglePreview } = {}){
  const btnMerge = document.getElementById('btnMerge');
  const btnPreview = document.getElementById('btnPreview');

  if (btnMerge){
    btnMerge.addEventListener('click', ()=>{
      btnMerge.classList.toggle('is-on');
      (onToggleMerge || toggleMerge)();
    });
  }
  if (btnPreview){
    const sync = (pressed)=>{
      btnPreview.setAttribute('aria-pressed', String(pressed));
      btnPreview.classList.toggle('is-on', pressed);
    };
    btnPreview.addEventListener('click', ()=>{
      const pressed = btnPreview.getAttribute('aria-pressed') === 'true' ? false : true;
      sync(pressed);
      (onTogglePreview || setPreviewEnabled)(pressed);
    });
    // 초기상태 표시
    if (!btnPreview.hasAttribute('aria-pressed')){
      btnPreview.setAttribute('aria-pressed','true');
      btnPreview.classList.add('is-on');
    }
  }
}
