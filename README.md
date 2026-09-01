# 할 일 목록 (Todo App)

의존성 없는 순수 HTML/CSS/JavaScript 할 일 관리 앱. 데이터는 브라우저
`localStorage`에 저장되어 새로고침해도 유지됩니다.

## 실행

빌드 과정이 없습니다. `index.html`을 브라우저로 열면 됩니다.

```bash
open index.html
```

또는 로컬 서버로:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

## 기능

- 할 일 추가 / 삭제
- 완료 토글
- 더블클릭(또는 항목에 포커스 후 Enter/Space)으로 수정, Esc로 취소
- 필터: 전체 / 진행 중 / 완료
- 완료 항목 일괄 삭제
- 남은 개수 표시
- `localStorage` 자동 저장 및 탭 간 동기화
- 라이트 / 다크 모드 (시스템 설정 따름)

## 파일 구조

| 파일 | 설명 |
| --- | --- |
| `index.html` | 마크업 + 할 일 항목 `<template>` |
| `styles.css` | CSS 변수 기반 테마와 스타일 |
| `app.js` | 상태 관리, 렌더링, 이벤트 처리 |
