/* 원래 마크업 스타일을 유지하면서
   - 링크 href 자동 구성
   - 상태(class) 도색 / 진행률 계산
   - 열 병합 토글(복원 포함)
   - 미리보기 ON/OFF 토글 신호 제공
*/

(function ($) {
  "use strict";

  // ====== 전역 플래그(미리보기 ON/OFF) ======
  window.__previewEnabled = true; // 페이지 최초 진입: ON

  // ====== 테이블 스냅샷(열 병합 복원용) ======
  var tableSnapshots = new Map();
  function snapshotTables() {
    $(".tbl.pub_list").each(function () {
      var $t = $(this);
      if (!tableSnapshots.has(this)) {
        tableSnapshots.set(this, $t.html()); // 원본 HTML 저장
      }
    });
  }
  function restoreTables() {
    tableSnapshots.forEach(function (html, node) {
      $(node).html(html);
    });
    // 복구 후 다시 링크/상태/진행률 세팅 & 미리보기 재바인딩 신호
    setupAll();
    $(document).trigger("tables:rebuilt");
  }

  // ====== 링크 자동 구성 ======
  // (원래 HTML 상단 스크립트와 동일한 동작을 재구현)
  function buildLinks() {
    var $wrap = $(".pub_list").find("a");

    $wrap.each(function () {
      var $a = $(this);
      var txt = $a.text().trim();
      var path = $a.closest("tr").find("td:eq(4)").text().trim();

      // 상위 섹션 코드(메인 제목의 <span>) 가져오기: COMMON / MAIN / STD / LAW / INT / OBL / CMP / APR
      var depthPath = $a.closest(".pub_list").prev(".tit2, .tit2_notCount").find("span").text().trim();

      // 공통 및 샘플 화면
      if (!depthPath) {
        // 예: ../../guide
        $a.attr({
          href: "page/" + path + "/" + txt + ".html",
          title: "새창열림",
          target: "_blank",
        });
      } else {
        // 일반페이지
        // 예: page/MAIN/ + (path?path+"/":"") + MAIN.html
        $a.attr({
          href: "page/" + depthPath + "/" + (path ? path + "/" : "") + txt + ".html",
          title: "새창열림",
          target: "_blank",
        });
      }
      $a.addClass("js-url"); // 미리보기 바인딩용 공통 클래스
    });
  }

  // ====== 상태 구분 / 진행률 ======
  function colorizeStatus() {
    var $rows = $(".pub_list").find("tbody tr");

    $rows.each(function () {
      var $tr = $(this);
      var lastTdText = $tr.find("td:last").text();

      if (lastTdText.includes("삭제")) {
        $tr.addClass("not");
      } else if (lastTdText.includes("완료")) {
        $tr.addClass("done");
      } else if (lastTdText.includes("수정")) {
        $tr.addClass("edit");
      } else if (lastTdText.includes("작업예정")) {
        $tr.addClass("work");
      } else if (lastTdText.includes("보류")) {
        $tr.addClass("hold");
      }
    });

    $(".not").find("a").contents().unwrap().wrap("<s></s>");
  }

  function calcProgress() {
    var $tbl = $(".count_list").find("tbody tr");
    setTimeout(function () {
      var notCount = $(".count_list").find("tbody .not, tbody .hold").length;
      var doneCount = $(".count_list").find("tbody .done, tbody .edit").length;
      var total = $tbl.length - notCount;
      var percentage = total > 0 ? (doneCount / total) * 100 : 0;

      $(".progress .total").text(total);
      $(".progress .page").text(doneCount);
      $(".progress .percent").text(percentage.toFixed(2) + "%");
    }, 10);
  }

  // ====== 열 병합 ======
  function mergeColumn(colIndex) {
    var prevText = "";
    var rowspan = 1;
    var firstTd = null;

    $(".tbl.pub_list tbody tr").each(function () {
      var $td = $(this).find("td").eq(colIndex);
      var currentText = ($td.text() || "").trim();

      if (currentText === "") return;

      if (prevText === currentText) {
        rowspan++;
        $td.remove();
      } else {
        if (firstTd && rowspan > 1) {
          firstTd.attr("rowspan", rowspan);
        }
        prevText = currentText;
        firstTd = $td;
        rowspan = 1;
      }
    });

    if (firstTd && rowspan > 1) {
      firstTd.attr("rowspan", rowspan);
    }
  }
  function doMergeAll() {
    // 순서: 세 번째 열(3Depth) → 두 번째 열(2Depth) → 화면명 열
    mergeColumn(3);
    mergeColumn(2);
    mergeColumn(1);
  }

  // ====== 버튼 바인딩 (텍스트 매칭) ======
  function bindButtons() {
    // 버튼을 텍스트로 탐색 (id/class 없이도 동작)
    var $mergeBtn = $("button, .btn, a").filter(function () {
      return $(this).text().trim().includes("열 병합");
    }).first();

    var $previewBtn = $("button, .btn, a").filter(function () {
      return $(this).text().trim().includes("미리보기");
    }).first();

    // 상태 토글 시 시각적 피드백(원본 스타일 안 바꾸고 class만)
    function setPressed($el, on) {
      $el.attr("aria-pressed", on ? "true" : "false");
      $el.toggleClass("on", !!on);
      // 텍스트가 "미리보기 ON/OFF" 라면 문구도 맞춰줌
      if ($el.is($previewBtn)) {
        var base = "미리보기 ";
        $el.text(base + (on ? "ON" : "OFF"));
      }
    }

    // 열 병합 토글
    var merged = false;
    $mergeBtn.off("click.merge").on("click.merge", function (e) {
      e.preventDefault();
      if (!merged) {
        doMergeAll();
        merged = true;
        setPressed($mergeBtn, true);
      } else {
        restoreTables();     // 스냅샷 복원
        merged = false;
        setPressed($mergeBtn, false);
      }
    });

    // 미리보기 토글
    setPressed($previewBtn, window.__previewEnabled);
    $previewBtn.off("click.preview").on("click.preview", function (e) {
      e.preventDefault();
      window.__previewEnabled = !window.__previewEnabled;
      setPressed($previewBtn, window.__previewEnabled);
      $(document).trigger("preview:toggle", [window.__previewEnabled]);
    });
  }

  // ====== 전체 셋업 ======
  function setupAll() {
    buildLinks();
    colorizeStatus();
    calcProgress();
  }

  // ====== 시작 ======
  $(function () {
    snapshotTables(); // 병합 전 원본 저장
    setupAll();       // 링크/상태/진행률
    bindButtons();    // 버튼 바인딩

    // 테이블 리빌드 시(복원/머지 후) 미리보기 재바인딩 요청
    $(document).trigger("tables:rebuilt");
  });

})(jQuery);
