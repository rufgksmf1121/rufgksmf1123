/* 원래 스타일/레이아웃 유지
   - 링크 a.js-url 에 마우스 올리면 "왼쪽 고정" 미리보기 패널 노출
   - 링크 클릭 시 새창 (common.js에서 target=_blank 지정)
   - 미리보기 ON/OFF, 테이블 복원/재머지와 연동
*/

(function ($) {
  "use strict";

  // ====== 프리뷰 패널 DOM/CSS 주입 (HTML 수정 없이) ======
  function ensurePreviewPanel() {
    if ($("#hoverPreview").length) return;

    var css = `
      #hoverPreview{
        position:fixed; left:16px; top:96px; width:420px; height:260px;
        background:#fff; border:1px solid #cbd5e1; border-radius:10px;
        box-shadow:0 10px 24px rgba(0,0,0,.12); overflow:hidden; z-index:9999;
        display:none;
      }
      #hoverPreview.show{ display:block; }
      #hoverPreview iframe{ width:100%; height:100%; border:0; background:#fff; }
    `;
    $("<style>").text(css).appendTo(document.head);

    var $panel = $('<div id="hoverPreview" aria-hidden="true"><iframe id="hoverFrame" loading="lazy" referrerpolicy="no-referrer"></iframe></div>');
    $("body").append($panel);
  }

  // ====== 미리보기 바인딩 ======
  function bindHoverPreview() {
    // 기존 바인딩 제거 후 다시
    $(document).off(".hoverPreview");

    $(document)
      .on("mouseenter.hoverPreview", ".pub_list a.js-url", function () {
        if (!window.__previewEnabled) return;
        var href = $(this).attr("href");
        if (!href) return;
        $("#hoverFrame").attr("src", href);
        $("#hoverPreview").addClass("show");
      })
      .on("mousemove.hoverPreview", ".pub_list a.js-url", function (e) {
        if (!window.__previewEnabled) return;
        // 왼쪽 고정, 세로만 커서에 따라 약간 이동
        var y = Math.max(80, e.clientY - 130);
        $("#hoverPreview").css({ top: y + "px" });
      })
      .on("mouseleave.hoverPreview", ".pub_list a.js-url", function () {
        $("#hoverPreview").removeClass("show");
        $("#hoverFrame").attr("src", "");
      })
      .on("click.hoverPreview", ".pub_list a.js-url", function () {
        // 클릭 시 패널 닫기(새창 이동)
        $("#hoverPreview").removeClass("show");
        $("#hoverFrame").attr("src", "");
      });

    // 미리보기 토글 시 패널 즉시 반영
    $(document).off("preview:toggle.hoverPreview").on("preview:toggle.hoverPreview", function (e, on) {
      if (!on) {
        $("#hoverPreview").removeClass("show");
        $("#hoverFrame").attr("src", "");
      }
    });

    // 테이블이 복원/재구성되면 다시 바인딩 보장
    $(document).off("tables:rebuilt.hoverPreview").on("tables:rebuilt.hoverPreview", function () {
      // 현재 구현은 live delegate 방식이라 별도 처리 불필요하지만,
      // 혹시 몰라 패널 상태만 클린업
      $("#hoverPreview").removeClass("show");
      $("#hoverFrame").attr("src", "");
    });
  }

  // ====== 시작 ======
  $(function () {
    ensurePreviewPanel();
    bindHoverPreview();
  });

})(jQuery);
