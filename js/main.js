// 엔트리 포인트: 나머지 모듈 초기화
import { initToolbar } from './app.common.js';
import { initTables, initSideNav } from './app.table.js';
import { installHoverPreview } from './app.preview.js';

document.addEventListener('DOMContentLoaded', () => {
  initToolbar({
    onToggleMerge: () => document.dispatchEvent(new CustomEvent('merge:toggle')),
    onTogglePreview: (on) => document.dispatchEvent(new CustomEvent('preview:toggle', { detail: on })),
  });

  initTables();       // 링크 자동 href, 진행률, 열병합 리스너
  initSideNav();      // 사이드바 점프/활성화

  // 미리보기: 기본 ON
  installHoverPreview({
    selector: 'a.js-url',
    width: 1440, height: 720, scale: 0.85, offsetX: 50, offsetY: -100,
    enabled: true,
  });
});
