// app.preview.js : 링크 호버 미리보기 (바닐라 JS)
import { isPreviewEnabled } from './app.table.js';

/**
 * 옵션
 *  - selector: 미리보기 대상 a 셀렉터
 *  - width, height: 프레임 원본 크기
 *  - scale: 축소 배율
 *  - offsetX, offsetY: 마우스 기준 오프셋
 */
export function installHoverPreview({ selector, width, height, scale, offsetX, offsetY }) {
  const anchors = document.querySelectorAll(selector);
  anchors.forEach(a => {
    a.addEventListener('mouseenter', (e) => {
      if (!isPreviewEnabled()) return;
      const frame = ensureFrame();
      frame.width = String(width);
      frame.height = String(height);
      frame.style.transform = `scale(${scale})`;
      frame.style.transformOrigin = 'top left';
      frame.src = a.href;
      positionFrame(frame, e.pageX, e.pageY, { width, height, scale, offsetX, offsetY });
      frame.hidden = false;
    });
    a.addEventListener('mousemove', (e) => {
      const frame = document.getElementById('hoverPreview');
      if (!frame || frame.hidden) return;
      positionFrame(frame, e.pageX, e.pageY, { width, height, scale, offsetX, offsetY });
    });
    a.addEventListener('mouseleave', () => {
      const frame = document.getElementById('hoverPreview');
      if (frame) frame.hidden = true;
    });
  });
}

function ensureFrame() {
  let frame = document.getElementById('hoverPreview');
  if (frame) return frame;
  frame = document.createElement('iframe');
  frame.id = 'hoverPreview';
  frame.className = 'preview';
  frame.setAttribute('aria-hidden', 'true');
  frame.hidden = true;
  document.body.appendChild(frame);
  return frame;
}

function positionFrame(frame, pageX, pageY, opt) {
  const { width, height, scale, offsetX, offsetY } = opt;
  const winW = window.innerWidth || document.documentElement.clientWidth;
  const winH = window.innerHeight || document.documentElement.clientHeight;

  const frameW = width * scale;
  const frameH = height * scale;

  let left = pageX + offsetX;
  let top = pageY + offsetY;

  const spaceRight = winW - (pageX - window.scrollX);
  const spaceBottom = winH - (pageY - window.scrollY);

  if (spaceRight < frameW + offsetX * 2) left = pageX - frameW - offsetX;
  if (spaceBottom < frameH + Math.abs(offsetY)) top = pageY - frameH - Math.abs(offsetY);

  frame.style.left = left + 'px';
  frame.style.top = top + 'px';
}
