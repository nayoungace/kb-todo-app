# kb-todo-app

Github [@nayoungace](https://github.com/nayoungace/) 유저의 프론트엔드 과제 구현 (React + TypeScript).

## 실행

```bash
pnpm install
pnpm dev          # 개발 서버 (MSW 목 서버 자동 기동)
pnpm build        # 타입 체크 + 프로덕션 빌드
pnpm preview      # 빌드 결과 미리보기
pnpm test         # 단위/통합 테스트 (Vitest)
pnpm lint         # oxlint
pnpm format       # prettier
```

Node 20 이상, 패키지 매니저는 pnpm(`packageManager` 필드에 고정).

## 기술 선택

| 선택                         | 사유                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite + React 19 + TypeScript | 과제 필수 조건, 과제가 어드민 성격의 SPA라 프레임워크(Next.js) 대신 번들러 기반 SPA로 구성했습니다.                                                                  |
| TanStack Router (file-based) | 타입 세이프 라우팅과 `beforeLoad` 기반 인증 가드를 표준 방식으로 제공. 라우트 트리는 코드젠되며 `src/routeTree.gen.ts`는 저장소에 커밋한다.                                            |
| TanStack Query               | 목록의 무한 스크롤 페이지 캐시, 삭제 후 목록/대시보드 재검증 등 서버 상태 정합성을 한 곳에서 관리하기 위함.                                                                            |
| fetch 기반 자체 `httpClient` | 과제에서 필요한 기능(JSON, Bearer 헤더, 쿼리스트링, 쿠키 전송, 401 재시도)이 표준 fetch로 충분하고, 401 → refresh → 재시도 파이프라인을 명시적으로 드러내도록 합니다. |
| MSW                          | 앱 코드가 목 환경을 인지하지 않도록 네트워크 경계에서 가로챕니다. 브라우저(`src/mocks/browser.ts`)와 테스트(`src/mocks/server.ts`)가 동일한 핸들러를 공유합니다.                           |
| Tailwind CSS v4              | `@theme` 블록에서 색상 토큰을 선언하면 그대로 유틸리티가 되므로, 색상을 토큰으로 관리하기 위해 선택했습니다.                                                              |
| react-hook-form + zod        | 로그인 폼의 필드별 검증과 "두 필드가 모두 유효할 때만 제출 활성화" 조건을 스키마 하나로 다루기 위함.                                                                                   |
| Vitest + Testing Library     | Vite 설정을 공유하고, 분기가 있는 로직(검증 스키마, 삭제 모달 활성화 조건, refresh 재시도) 위주로 테스트합니다.                                                                          |

## 디렉터리 구조 (FSD)

```
src/
├── app/          # 진입점, 프로바이더, 라우터/쿼리 클라이언트, 글로벌 스타일
├── routes/       # TanStack Router 코드젠 대상. pages 레이어를 연결만 하는 얇은 파일
├── pages/        # 화면 단위 조립
├── widgets/      # 여러 도메인을 합성하는 UI 블록 (GNB 등)
├── features/     # 사용자 행위 단위 (로그인, 할 일 삭제 등)
├── entities/     # 도메인 모델과 Repository (session, task, user, dashboard)
├── shared/       # httpClient, 공용 UI, 설정, 유틸
├── mocks/        # MSW 핸들러 (브라우저/노드 공용)
└── test/         # 테스트 셋업
```

`routes/`와 `pages/`를 분리한 이유: 라우트 디렉터리는 파일 이름이 곧 URL이고 코드젠 대상이라 FSD의 슬라이스 규칙을 적용할 수 없다. 라우트 파일은 `createFileRoute`와 컴포넌트 연결만 담당하고, 실제 화면 조립은 `pages/`에 둔다.

## 색상 토큰

`src/app/styles/global.css`의 `@theme` 블록에 의미 기반 이름으로만 정의한다(`primary`, `disabled`, `danger`, `surface`, `border`, `text` 등). 컴포넌트에서 원시 팔레트나 hex를 직접 쓰지 않는다.