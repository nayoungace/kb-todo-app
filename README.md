# kb-todo-app

Github [@nayoungace](https://github.com/nayoungace/) 유저의 프론트엔드 과제 구현 (React + TypeScript).

## 실행

```bash
pnpm install
pnpm dev          # 개발 서버 (MSW 목 서버 자동 기동)
pnpm build        # 타입 체크 + 프로덕션 빌드
pnpm preview      # 빌드 결과 미리보기 (여기서도 MSW 가 기동한다)
pnpm test         # 단위/통합 테스트 (Vitest)
pnpm lint         # oxlint + steiger(FSD 구조 검사)
pnpm lint:fsd     # FSD 구조 검사만
pnpm format       # prettier
```

Node 20 이상, 패키지 매니저는 pnpm(`packageManager` 필드에 고정).

로그인 계정은 `test@foo.co.kr` / `password123` 이다. 실제 백엔드가 없으므로 MSW 를 `dev` 뿐 아니라 **프로덕션 빌드에서도 기동**한다. `pnpm build && pnpm preview` 로 띄운 결과물에서도 모든 화면이 그대로 동작한다.

## 기술 선택

| 선택                         | 사유                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite + React 19 + TypeScript | 과제 필수 조건, 과제가 어드민 성격의 SPA라 프레임워크(Next.js) 대신 번들러 기반 SPA로 구성했습니다.                                                                                             |
| TanStack Router (file-based) | 타입 세이프 라우팅과 `beforeLoad` 기반 인증 가드를 표준 방식으로 제공. 라우트 트리는 코드젠되며 `src/routeTree.gen.ts`는 저장소에 커밋합니다.                                                   |
| TanStack Query               | 목록의 무한 스크롤 페이지 캐시, 삭제 후 목록/대시보드 재검증 등 서버 상태 정합성을 한 곳에서 관리하기 위함입니다.                                                                               |
| fetch 기반 자체 `httpClient` | 과제에서 필요한 기능(JSON, Bearer 헤더, 쿼리스트링, 쿠키 전송, 401 재시도)이 표준 fetch로 충분하고, 401 → refresh → 재시도 파이프라인을 명시적으로 드러내도록 합니다.                           |
| MSW                          | 앱 코드가 목 환경을 인지하지 않도록 네트워크 경계에서 가로챕니다. 브라우저(`src/mocks/browser.ts`)와 테스트(`src/mocks/server.ts`)가 동일한 핸들러를 공유합니다.                                |
| Tailwind CSS v4              | `@theme` 블록에서 색상 토큰을 선언하면 그대로 유틸리티가 되므로, 색상을 토큰으로 관리하기 위해 선택했습니다.                                                                                    |
| shadcn/ui (`radix-luma`)     | 의존성이 아니라 소스를 복사해 저장소가 직접 소유하는 방식이라 라이브러리 종속이 없고, 요구되는 모달 2종의 접근성을 Radix 프리미티브로 확보합니다. 상세 근거는 [스타일 정책](#스타일-정책) 참고. |
| Pretendard                   | 과제 필수 조건. npm 패키지의 dynamic subset CSS 를 임포트해 CDN 의존 없이 번들에 포함시키고, Tailwind 의 `--font-sans` 로 연결해 전역 기본 폰트로 적용합니다.                                   |
| react-hook-form + zod        | 로그인 폼의 필드별 검증과 "두 필드가 모두 유효할 때만 제출 활성화" 조건을 스키마 하나로 다루기 위함.                                                                                            |
| Vitest + Testing Library     | Vite 설정을 공유하고, 분기가 있는 로직(검증 스키마, 삭제 모달 활성화 조건, refresh 재시도) 위주로 테스트합니다.                                                                                 |

## 디렉터리 구조 (FSD)

```
src/
├── app/          # 진입점, 프로바이더, 라우터/쿼리 클라이언트, 글로벌 스타일
├── routes/       # TanStack Router 코드젠 대상. pages 레이어를 연결만 하는 얇은 파일
├── pages/        # 화면 단위 조립
├── widgets/      # 여러 도메인을 합성하는 UI 블록 (앱 셸/GNB/LNB 등)
├── features/     # 사용자 행위 단위 — 로그인(auth-sign-in), 할 일 삭제(task-delete)
├── entities/     # 도메인 모델과 Repository/Queries — session, task, user, dashboard
├── shared/       # 공용 UI(직접 만든 것은 shared/ui, shadcn 산출물은 shared/shadcn), 설정, 유틸
│                 #   shared/api 에 httpClient, tokenStore, 401 refresh
├── mocks/        # MSW 핸들러 (브라우저/노드 공용)
└── test/         # 테스트 셋업
```

`routes/`와 `pages/`를 분리한 이유: 라우트 디렉터리는 파일 이름이 곧 URL이고 코드젠 대상이라 FSD의 슬라이스 규칙을 적용할 수 없다. 라우트 파일은 `createFileRoute`와 컴포넌트 연결만 담당하고, 실제 화면 조립은 `pages/`에 둔다.

### 슬라이스 규칙

`pages`/`widgets`/`features`/`entities`의 각 슬라이스는 세그먼트(`ui`, `api`, `model`, `lib`)로 나누고, `index.ts`를 public API로 두어 **바깥에서는 항상 슬라이스 루트로만 import**한다.

```ts
import { DashboardPage } from '@/pages/dashboard' // O
import { DashboardPage } from '@/pages/dashboard/ui/dashboard-page' // X
```

같은 레이어의 슬라이스끼리는 서로 참조하지 않는다. GNB(`app-header`)와 LNB(`app-sidebar`)를 별도 위젯으로 두지 않고 `widgets/app-shell` 슬라이스 내부에 둔 것이 이 규칙 때문이다. 셸 없이 단독으로 쓰이지 않으므로 슬라이스를 나눌 이유가 없다.

**예외 — `shared/`**: FSD에서 `shared`는 슬라이스가 없고 세그먼트가 바로 오는 레이어이므로 위 규칙의 대상이 아니다. 또 `shared/shadcn/`에 배럴을 두면 shadcn CLI가 컴포넌트를 추가할 때마다 수동 갱신이 필요해 깨지기 쉽다. 따라서 `shared`는 원칙적으로 **파일 단위로 직접 import**한다.

```ts
import { Button } from '@/shared/shadcn/ui/button'
import { ROUTES } from '@/shared/config/routes'
import { StatCard } from '@/shared/ui/stat-card'
```

단 하나의 예외가 `shared/api`다. `httpClient`, `tokenStore`, `refreshAccessToken`, `HttpError`는 "401을 만나면 refresh 후 재시도한다"는 하나의 파이프라인을 이루고 바깥에서는 그 조합만 쓰므로, 내부 파일 분할을 감추도록 세그먼트 단위 public API(`shared/api/index.ts`)를 둔다. shadcn 처럼 생성물이 계속 늘어나는 곳이 아니라 배럴 유지 비용도 없다.

```ts
import { httpClient, HttpError } from '@/shared/api'
```

### 규칙 검사

위 규칙은 리뷰가 아니라 [steiger](https://github.com/feature-sliced/steiger)(FSD 공식 린터)가 `pnpm lint`에서 검사한다. 레이어 하향 참조, 같은 레이어 슬라이스 간 참조, 슬라이스 public API 우회가 자동으로 걸린다.

문서화한 예외는 `steiger.config.js`에서 사유와 함께 끈다. 세 가지다.

| 끈 규칙                                          | 범위            | 사유                                                                                                                                     |
| ------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `fsd/public-api`, `fsd/no-reserved-folder-names` | `src/shared/**` | 위 "예외 — `shared/`"                                                                                                                    |
| `fsd/no-public-api-sidestep`                     | 전체            | `shared`에 배럴이 없으므로 파일 단위 진입이 정상 경로다                                                                                  |
| `fsd/insignificant-slice`                        | 전체            | `widgets`/`pages`는 코드젠 대상인 `src/routes`에서만 참조되어 참조 수가 세어지지 않는다                                                  |

### 데이터 레이어

서버 데이터는 `entities/*/api`의 **Repository**(HTTP 호출)와 `entities/*/model`의 **Queries**(캐시 정책)로 나눈다. Repository는 정적 메서드 클래스이고 react-query에 의존하지 않으며, Queries는 `queryOptions`/`infiniteQueryOptions` 팩토리 객체다. 뮤테이션은 `features/`의 훅에 둔다.

로그인처럼 성공 후 세션 반영과 화면 이동이 따라붙는 뮤테이션은 `features/auth-sign-in`의 훅이 들고, 페이지는 폼 UI만 맡는다.

## 스타일 정책

스타일은 **shadcn/ui 를 우선**한다. 자체 디자인 토큰을 따로 만들지 않고 shadcn 규약을 단일 출처로 쓴다.

### 왜 shadcn/ui 인가

UI 라이브러리 선택에서 가장 큰 비용은 종속이다. shadcn 은 npm 의존성이 아니라 소스를 저장소로 복사해 오는 방식이므로, 결과물은 이 저장소가 소유하는 평범한 컴포넌트 파일이다. 요구가 맞지 않으면 파일을 고치면 되고, 라이브러리의 테마 API 나 오버라이드 규약을 우회할 일이 없다. shadcn 을 도입해 실제로 늘어난 런타임 의존은 `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` 이며, 이는 Radix 를 직접 조립하더라도 대부분 필요한 것들이다.

요구사항 관점에서는 세 가지가 근거가 된다.

1. **접근성**: 로그인 실패 안내와 삭제 확인, 두 곳에서 모달이 필요하다. 포커스 트랩과 복원, `aria-modal`, ESC/오버레이 닫기, 스크롤 락은 직접 구현 시 누락되기 쉬운데 Radix Dialog 기반이라 검증된 구현을 그대로 쓴다.
2. **색상 토큰**: 요구사항이 색상의 토큰 관리를 명시한다. shadcn 은 CSS 변수로 토큰을 선언하고 Tailwind `@theme` 이 이를 유틸리티로 노출하므로, 별도 토큰 체계를 설계하지 않고도 조건을 만족한다.
3. **시간 배분**: 요구사항이 심미성을 평가하지 않는다고 명시한 만큼, 시각 디자인보다 가상 스크롤, 무한 스크롤, 토큰 갱신 같은 로직에 시간을 쓰는 편이 낫다고 판단했다.

`baseColor` 는 `olive` 를 사용한다. 요구사항의 `primary: blue` 는 토큰화 방식을 설명하는 예시로 읽어, 특정 색상값을 강제하는 조건으로 보지 않았다.

### 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add <component>   # → src/shared/shadcn/ui/ 에 생성된다
```

shadcn CLI 산출물은 모두 `src/shared/shadcn/` 아래로 모은다. 직접 만든 공용 컴포넌트는
`src/shared/ui/` 에 두어, 생성물과 직접 작성한 코드를 섞지 않는다.
