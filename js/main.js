
import { configureTables, toggleMerge, setPreviewEnabled, initSideNav } from './app.table.js';
import { initToolbar } from './app.common.js';
import { installHoverPreview } from './app.preview.js';
initSideNav();
configureTables();
installHoverPreview({ selector: '.js-pub a', width: 1440, height: 720, scale: 0.85, offsetX: 50, offsetY: -100 });
initToolbar({
  onToggleMerge: toggleMerge,
  onTogglePreview: (pressed)=> setPreviewEnabled(pressed),
});
document.addEventListener('tables:rebuilt', ()=>{
  installHoverPreview({ selector: '.js-pub a', width: 1440, height: 720, scale: 0.85, offsetX: 50, offsetY: -100 });
});
