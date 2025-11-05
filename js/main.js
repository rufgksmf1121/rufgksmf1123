// 미리보기 ON/OFF 토글 상태 (버튼은 이미 헤더 아래 툴바에 존재)
const previewToggleBtn = document.querySelector('[data-action="preview"]');

// 단일 프리뷰 iframe을 동적으로 생성/관리
let previewFrame = null;
let hideTimer = null;
let showTimer = null;

function ensurePreviewFrame() {
  if (previewFrame) return previewFrame;
  previewFrame = document.createElement('iframe');
  previewFrame.className = 'preview';
  // CSS를 수정하지 않고 JS에서 "왼쪽 가운데 고정" 배치
  Object.assign(previewFrame.style, {
    position: 'fixed',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '640px',
    height: '420px',
    border: '0',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,.25)',
    background: '#fff',
    zIndex: '9999',
    pointerEvents: 'none',
    display: 'none',
  });
  document.body.appendChild(previewFrame);
  return previewFrame;
}

function showPreview(href) {
  if (!previewToggleBtn || previewToggleBtn.getAttribute('aria-pressed') !== 'true') return;
  const frame = ensurePreviewFrame();
  // 살짝 딜레이를 줘서 의도치 않은 깜빡임 방지
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    frame.src = href;
    frame.style.display = 'block';
  }, 120);
}

function hidePreview() {
  const frame = ensurePreviewFrame();
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    frame.style.display = 'none';
    // 리소스 절약을 위해 src 제거(크로스도메인 보안 이슈 회피에도 도움)
    frame.removeAttribute('src');
  }, 80);
}

// 미리보기 ON/OFF 버튼 동작
if (previewToggleBtn) {
  previewToggleBtn.addEventListener('click', () => {
    const pressed = previewToggleBtn.getAttribute('aria-pressed') === 'true';
    previewToggleBtn.setAttribute('aria-pressed', String(!pressed));
    if (pressed) hidePreview();
  });
}

// 모든 테이블 내 링크들에 미리보기 이벤트 부착
const linkSelector = 'table.grid a[href]';
const links = document.querySelectorAll(linkSelector);

links.forEach((a) => {
  // 마우스 오버 시 프리뷰
  a.addEventListener('mouseenter', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    showPreview(href);
  });
  // 포커스(키보드 탭) 시 프리뷰
  a.addEventListener('focus', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    showPreview(href);
  });
  // 마우스가 떠나면 프리뷰 숨김
  a.addEventListener('mouseleave', hidePreview);
  // 포커스 해제 시 프리뷰 숨김
  a.addEventListener('blur', hidePreview);

  // 클릭하면 해당 사이트로 이동(기본 동작 유지)
  // 단, 미리보기 iframe이 pointer-events:none 이므로 클릭에는 영향 없음
});

// 페이지 타이틀과 헤더 h1 싱크(기존 보호 로직 유지)
(function () {
  const h1 = document.querySelector('header h1');
  if (h1) {
    const t = (document.title.split('·')[0] || '').trim();
    h1.textContent = t || 'AML Solution 작업 리스트';
  }
})();
