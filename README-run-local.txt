# AI Solution Rebuilt (KYH-style)

## 왜 버튼이 안 먹히나요?
이 프로젝트는 **ES 모듈**(`type="module"`)을 사용합니다. 파일을 `file://`로 직접 여는 경우
브라우저가 보안상 **모듈 import를 막아** 스크립트가 실행되지 않습니다.
즉, 버튼 동작/스타일 토글이 전혀 일어나지 않습니다.

## 실행 방법 (아무거나 택1)
- Python 내장 서버
```bash
cd <프로젝트 폴더>
python -m http.server 5500
# 브라우저에서 http://localhost:5500/index.html 열기
```
- VS Code 확장: Live Server (index.html에서 "Open with Live Server")
- Node:
```bash
npx serve . -p 5500
```

## 버튼 설명
- **미리보기 ON**: URL 셀의 링크 위에 마우스를 올리면 축소된 페이지를 iframe으로 띄웁니다. 버튼을 눌러 ON/OFF 전환.
- **열 병합 토글**: 2/3/4열(2Depth,3Depth,화면명)의 연속 텍스트를 `rowspan`으로 묶었다가 풀었다가 합니다.

## 주의
- 미리보기는 링크가 가리키는 경로(`page/<섹션>/<path>/<파일>.html`)에 실제 파일이 존재해야 화면이 보입니다.
