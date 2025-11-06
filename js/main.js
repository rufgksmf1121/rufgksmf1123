import { configureTables, toggleMerge, setPreviewEnabled, initSideNav } from './app.table.js';
import { initToolbar } from './app.common.js';
import { installHoverPreview } from './app.preview.js?v=2';

initSideNav();
configureTables();

installHoverPreview({ selector: '.js-pub a', width: 1280, height: 720, scale: 0.85 });

initToolbar({
  onToggleMerge: toggleMerge,
  onTogglePreview: (pressed)=> setPreviewEnabled(pressed),
});

document.addEventListener('tables:rebuilt', ()=>{
  installHoverPreview({ selector: '.js-pub a', width: 1280, height: 720, scale: 0.85 });
});
