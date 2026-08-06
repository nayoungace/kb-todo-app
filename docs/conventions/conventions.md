# 프론트엔드 컨벤션

접근성, 데이터 레이어, 목 서버, UI 상태 네 영역의 확정 규칙. 기준은 현재 `dev` 작업 트리의 코드다.

코드에는 설명 주석을 달지 않는다. 유일한 예외는 목 계층의 `//- 프로덕션과 다름.` 주석이다(→ [3.4절](#34-프로덕션과-다른-부분)).

전제 스택: React 19 + TypeScript, TanStack Router(파일 기반) / Query / Virtual, react-hook-form + zod(폼 전용), Tailwind 4 + shadcn/ui(소스 복사, Radix 기반), MSW 2, Vitest + Testing Library. 구조는 FSD(`app / routes / pages / widgets / features / entities / shared / mocks`)이고 steiger가 경계를 검사한다.

---

## 1. 접근성 컨벤션

### 1.1 화면 식별

| 신호 | 담당 | 값 |
| --- | --- | --- |
| 화면의 주제 | 각 페이지의 `h1` | `대시보드`, `할 일`, `할 일 상세`, `회원정보`, `로그인`, `페이지를 찾을 수 없습니다.` |
| 브라우저 탭, 히스토리, 북마크 | 라우트의 `head` → `<HeadContent />` | `pageTitle('{화면명}')` |
| 라우트 전환 사실 | `useRouteFocus` | 콘텐츠 영역으로 포커스 이동 |
| 사이트 정체성 | 사이드바 헤더의 홈 링크 (`KB TODO`) | 제목이 **아니다** |

- **`h1`은 화면당 하나, 사이트명이 아니라 화면명이다.** 각 페이지는 `<section>`(로그인·404는 `<main>`) 하나에 `h1` 하나를 갖는다. 할 일 상세의 `h1`도 항목 제목이 아니라 화면명(`할 일 상세`)이다 — 항목 구분은 카드 안의 제목 필드가 맡는다.
- **`h1` 아래 제목 계층은 건너뛰지 않는다.** 목록 화면의 할 일 카드 제목은 `h2`다.
- **404 화면의 제목은 상태 코드가 아니다.** 큰 `404` 숫자는 `aria-hidden` 장식이고, `h1`은 `페이지를 찾을 수 없습니다.`다. 두 종류의 404는 `NotFoundPanel`(`shared/ui`)을 공유하고 복귀 지점만 다르다.

| 404 | 담당 | 복귀 지점 |
| --- | --- | --- |
| 리소스 부재 (할 일 상세) | `TaskNotFound` | 목록 |
| 라우트 없는 주소 | 스플랫 라우트 `routes/$.tsx` | 대시보드 |

### 1.2 문서 타이틀

- **모든 라우트가 `head`로 제목을 선언한다.** `__root.tsx`가 `KB TODO`를 기본값으로 깔고, 하위 라우트가 `pageTitle('{화면명}')`으로 덮는다.
- **접미사는 `pageTitle`(`shared/config/page-title.ts`)만 붙인다.** 라우트는 화면명만 넘기고, 화면명이 앞에 온다(탭이 좁아질 때 잘리는 쪽은 뒤). 테스트도 완성 문자열 대신 `pageTitle`을 거친다.
- **`<HeadContent />`는 `__root.tsx`에 하나.**
- `index.html`의 `<title>`은 JS 로드 전 폴백이므로 접미사 없이 `KB TODO`.

### 1.3 포커스

- **라우트 전환 시 콘텐츠 컨테이너(`tabIndex={-1}`)로 포커스를 옮긴다**(`useRouteFocus`).
  - `pathname`이 바뀔 때만 옮긴다. 같은 경로의 리렌더에서는 옮기지 않는다.
  - 첫 렌더에서는 옮기지 않는다.
  - `preventScroll: true` — 라우터의 `scrollRestoration`과 충돌하지 않게 한다.
  - 컨테이너의 포커스 링은 숨긴다(`outline-none`).
- 라우트 전환을 알리는 별도 live region은 두지 않는다 — 포커스 이동으로 `h1`이 읽힌다.
- **모달의 포커스 트랩·복원·ESC·스크롤 락은 Radix Dialog(shadcn)에 위임한다.** 직접 구현하지 않는다.

### 1.4 랜드마크와 현재 위치

| 랜드마크 | 요소 | 이름 |
| --- | --- | --- |
| `banner` | `AppHeader`의 `header` | — |
| `navigation` | GNB | `주요 메뉴` |
| `navigation` | LNB 본문 | `사이드 메뉴` |
| `navigation` | LNB 하단(회원정보/로그인) | `계정` |
| `main` | 콘텐츠 컨테이너(`#main-content`) | — |

- **`main`은 콘텐츠 컨테이너 하나뿐이다.** `header`가 `main` 안에 있으면 `banner`가 되지 않으므로, 셸은 `SidebarInset`(`main`을 렌더한다)을 **쓰지 않고** 같은 자리를 `div`로 직접 렌더한다.
- **스킵 링크(`본문으로 건너뛰기`)를 헤더보다 먼저 둔다.** 평소에는 화면 밖으로 밀어 두고 포커스를 받을 때만 보인다. `sr-only`/`not-sr-only` 조합 대신 `translate`로 감춘다 — `position` 유틸리티가 서로를 덮지 않게 한다.
- **현재 위치 항목에는 `aria-current="page"`를 건다.** 시각적 활성 표시(`SidebarMenuButton`의 `isActive`)와 **같은 판정**(`matchRoute`)을 쓴다.

### 1.5 이름 붙이기

- **폼 컨트롤은 보이는 `label` + `htmlFor`/`id`.** 모달의 확인 입력도 예외가 아니다. `aria-label`의 용처는 로딩 영역(`role="status"`)과 랜드마크(`nav aria-label="주요 메뉴"`) 둘뿐이다.
- **`autoComplete`는 항상 명시한다.** 이메일 `email`, 비밀번호 `current-password`, 삭제 확인 입력 `off`.
- **폼에는 `noValidate`.** 검증의 단일 출처는 zod다.
- **오류 문구는 `FieldError`(`role="alert"`)로 내고, `aria-invalid`·`data-invalid`·`aria-describedby`를 문구와 같은 조건으로 건다**(게이트 규칙 → [4.7절](#47-폼-유효성-표시)). 문구가 없을 때는 `aria-describedby`도 걸지 않는다 — `FieldError`가 아무것도 렌더하지 않으므로 가리킬 대상이 없다.
- **라벨과 값이 나란히 놓이는 카드는 `DetailField`(`shared/ui`)로 만든다.** `role="group"` + `aria-labelledby`로 라벨을 값에 연결한다. 할 일 상세와 회원정보가 같은 컴포넌트를 쓴다.
- **장식은 숨긴다.** 404 숫자, 라벨 있는 컨트롤 안의 아이콘은 `aria-hidden`/이름 없음. 아이콘 단독 컨트롤은 만들지 않는다.
- **내비게이션으로 동작하는 버튼은 `asChild` + `<Link>`로 실제 `<a>`를 렌더한다.**
- **카드 전체가 링크인 요소에는 `focus-visible` 링을 명시한다**(`focus-visible:ring-[3px]`).
- **가상 목록도 목록으로 읽히게 한다.** `<ul role="list">`를 명시하고(Tailwind preflight의 `list-style: none`이 시맨틱을 지운다) 각 항목에 `aria-posinset`과 `aria-setsize`를 단다. 다음 페이지가 남아 전체 개수가 확정되지 않았으면 `aria-setsize`는 `-1`이다.
- 테스트 쿼리는 `getByRole` / `getByLabelText`를 기본으로 한다 — 이름과 역할이 없으면 테스트가 먼저 깨진다.

---

## 2. 데이터 레이어 컨벤션

### 2.1 구성

| 위치 | 이름 | 책임 | 의존 |
| --- | --- | --- | --- |
| `entities/*/api` | Repository | HTTP 호출과 경로, 파라미터 조립 | `shared/api`의 `httpClient` |
| `entities/*/model` | Queries | 캐시 정책(쿼리 키, 페이지네이션, meta) | `@tanstack/react-query` |
| `features/*/model` | 뮤테이션 훅 | 쓰기 동작과 성공, 실패 후처리(캐시와 이동) | Queries, Repository, 라우터 |

읽기는 `entities`에서 끝나고, 쓰기는 항상 `features`의 훅을 거친다. **Service 레이어는 두지 않는다** — 조합·변형이 필요해지면 `entities/*/model`에 파생 함수를 추가한다.

### 2.2 Repository

```ts
export class TaskRepository {
  public static async getDetail(id: string, signal?: AbortSignal): Promise<TaskDetailResponse> {
    return httpClient.get<TaskDetailResponse>(`/api/task/${encodeURIComponent(id)}`, { signal })
  }
}
```

- **정적 메서드 클래스로 쓴다.** 호출부는 `TaskRepository.remove(id)` 형태로 주어를 드러낸다.
- **react-query를 import 하지 않는다.** 캐시·재시도·무효화는 Queries와 뮤테이션 훅의 몫이다.
- **`AbortSignal`을 마지막 인자로 받아** react-query의 signal을 그대로 흘려보낸다.
- **경로 파라미터는 `encodeURIComponent`로 감싼다.**
- 응답·요청 타입은 `entities/*/model/types.ts`의 `interface`로 두고 openapi 스키마와 1:1로 맞춘다. 런타임 파싱은 하지 않는다 — zod는 폼 입력 전용이다.

### 2.3 Queries

```ts
const taskKey = ['task'] as const

export const taskQueries = {
  list: () => infiniteQueryOptions({ queryKey: [...taskKey, 'list'] as const, ... }),
  detail: (id: string) => queryOptions({ queryKey: [...taskKey, 'detail', id] as const, ... }),
}
```

- 도메인마다 `queryOptions`/`infiniteQueryOptions` 팩토리를 모은 `*Queries` 객체 하나.
- **쿼리 키는 팩토리를 통해서만 얻는다.** 호출부에서 키 배열을 손으로 쓰지 않는다(`taskQueries.list().queryKey`).
- **키 계층은 `['도메인']` → `['도메인', '작업', ...인자]`까지만.** 페이지 번호는 키가 아니라 `pageParam`으로 관리한다. 접두사 무효화가 성립하는 깊이를 유지한다.
- 소비는 페이지 컴포넌트의 `useQuery(xQueries.y())` 직접 호출. 읽기 래퍼 훅은 만들지 않는다.
- 공통 정책은 `app/query-client.ts`의 `defaultOptions`에 두고, 쿼리별로 다른 것만 개별 선언한다.

### 2.4 뮤테이션 훅

- `mutationFn`은 Repository 메서드를 그대로 참조한다.
- 캐시 갱신과 화면 이동은 `onSuccess`/`onError`에서 처리한다.
- 반환값은 `{ 동사, isPending }` 형태의 좁은 인터페이스다(`UseSignIn`, `UseDeleteTask`).
- 낙관적 갱신(`onMutate`/`setQueryData`)은 쓰지 않는다.

### 2.5 캐시 갱신 정책

**비활성 캐시는 `removeQueries`, 활성(마운트된) 캐시는 `resetQueries` 또는 `invalidateQueries`.** `removeQueries`를 활성 쿼리에 쓰면 재요청이 걸리지 않아 화면이 로딩에 갇힌다.

삭제(`useDeleteTask`):

| 결과 | 처리 |
| --- | --- |
| 성공 | 목록 캐시 제거 → `/task` 이동 → 상세 캐시 제거 → 대시보드 무효화 |
| 404 | 목록 캐시 제거 → 상세 쿼리 **reset** → 대시보드 무효화 (이동하지 않음, 전역 모달 노출) |
| 401 | `httpClient`가 refresh 1회 후 재시도. 최종 실패면 토큰 폐기 → `AuthGate`가 안내로 대체 |
| 5xx, 네트워크 | 캐시를 건드리지 않는다. 상세 화면을 유지한다 |

목록 캐시는 이동 **전에** 지운다 — 이동 후에 지우면 삭제된 항목이 한 프레임 그려진다.

세션 폐기(`clearSession` + `useLogout`) 순서:

1. `tokenStore.clear()` — 메모리의 accessToken 폐기
2. refresh 쿠키를 `Max-Age=0`으로 만료
3. 구독자 통지 — GNB 분기가 `useSyncExternalStore`로 즉시 갱신
4. `/sign-in` 이동이 **끝난 뒤** `queryClient.clear()` — 먼저 비우면 마운트된 보호 화면이 재요청을 걸어 401 경로를 한 번 더 태운다

### 2.6 HTTP 파이프라인 (`shared/api`)

- **인증 요청(`auth: true`, 기본값)이 401을 받으면 `refreshAccessToken()` 후 1회만 재시도한다.** refresh는 단일 프로미스에 합류시켜 동시 401에도 한 번만 나간다. 실패 시 토큰을 폐기하고 401을 그대로 올린다.
- **JWT `exp`로 선제 갱신하지 않는다.** 401을 받고 반응한다.
- **accessToken은 메모리에만 둔다**(`token-store.ts`). 저장소에 쓰지 않고, 새로고침 복원은 refresh 쿠키(`bootstrapSession`)로 한다.
- **에러 메시지는 응답 본문의 `errorMessage`, 없으면 `FALLBACK_MESSAGE`.** 상태 코드를 메시지에 넣지 않는다. 상태 코드는 `HttpError.status`, 인증 요청 여부는 `HttpError.authenticated`에 보존한다.
- **재시도: 쿼리는 1회, 4xx는 재시도하지 않는다**(`shouldRetryQuery`). **뮤테이션은 재시도하지 않는다**(`retry: 0`).
- 기본값: `staleTime: 30_000`, `refetchOnWindowFocus: false`. `204`/빈 본문은 `undefined`.

### 2.7 세션 부트스트랩과 화면 보호

- `main.tsx`가 렌더 전에 `bootstrapSession()`(1회 실행 프로미스)을 시작한다.
- **보호 화면은 라우트 가드가 아니라 `AuthGate` 컴포넌트가 지킨다.** refresh 실패 시 주소를 유지한 채 안내 화면으로 바꾸기 위해서다(→ [4.6절](#46-세션-상태의-표현)).
- `/sign-in`은 반대로 `beforeLoad`에서 로그인 상태면 대시보드로 `redirect`한다.

### 2.8 서버 값의 표기 변환

`formatDateTime`(`shared/lib/date.ts`)은 ISO 문자열을 `ko-KR` 포맷으로 바꾸되, **파싱 불가 값은 원본 문자열을 그대로 돌려준다.** 표기 유틸이 `Invalid Date` 노출의 원인이 되지 않게 한다.

---

## 3. 목 서버 컨벤션 (MSW)

목 서버는 개발 보조가 아니라 **배포된 결과물의 백엔드**다. openapi 계약을 그대로 재현한다: bearer 검증, 만료 판정, 디코딩 가능한 JWT, `Set-Cookie` 기반 refresh 쿠키, 401/404 응답.

### 3.1 기동

- **프로덕션 빌드에서도 워커를 띄운다**(`src/app/main.tsx`). `pnpm build && pnpm preview`에서도 전 화면이 동작한다.
- 브라우저(`browser.ts`)와 테스트(`server.ts`)는 같은 핸들러 배열(`handlers/index.ts`)을 공유한다.
- `onUnhandledRequest`: 브라우저 `'bypass'`, 테스트 `'error'`.

### 3.2 핸들러 규칙

```ts
http.get('/api/task', async ({ request }) => {
  await networkDelay()
  if (!requireAuth(request)) return unauthorized()
  ...
```

- **모든 핸들러의 첫 두 줄은 같다**: `networkDelay()`(테스트에서는 0), 보호 API면 `requireAuth`.
- **에러 응답은 항상 `HttpResponse.json({ errorMessage }, { status })`.**
- **응답은 계약에 정의된 필드로 잘라서 내보낸다.** 목 DB 내부 필드가 새어 나가지 않게 매핑한다.
- **입력은 핸들러가 검증한다.** `GET /api/task`의 잘못된 `page`(누락, 비정수, 1 미만)는 400.
- **access token TTL은 30초, refresh 쿠키는 7일.** 401 → refresh → 재시도 경로를 브라우저에서 바로 관찰하기 위한 값이다.

### 3.3 목 데이터의 수명

- **목 DB는 `sessionStorage`에 영속화한다**(`kb-todo-app:mock-tasks:v1`). 새로고침·주소 직접 입력에도 탭 세션 안에서는 서버처럼 일관되고, 새 탭은 항상 같은 시드로 시작한다. `localStorage`는 쓰지 않는다 — 지운 데이터가 무기한 남아 초기화 수단이 따로 필요해진다.
- **테스트에서는 영속화를 끈다.** `import.meta.env.TEST` 가드(`networkDelay`와 같은 방식)로 읽기·쓰기를 모두 건너뛴다. 테스트 초기화는 `src/test/setup.ts`의 `afterEach`(`cleanup` + `server.resetHandlers` + `resetMockDb` + `tokenStore.clear`)가 담당한다.
- **시드는 결정적이다** — 220건, `seq % 3 === 0`이면 `DONE`, 고정 기준 시각 + 1시간 간격. 테스트가 파생 수치를 그대로 쓸 수 있다.

### 3.4 프로덕션과 다른 부분

| 위치 | 지금 | 실제 환경이라면 |
| --- | --- | --- |
| `app/main.tsx` | MSW를 프로덕션 빌드에서도 기동 | dev 전용이거나 제거 |
| `mocks/handlers/auth.ts` | access token TTL 30초 | 수 분 단위 |
| `mocks/handlers/auth.ts` | refresh 쿠키에 `HttpOnly`, `Secure` 없음 (`Secure`는 `http://localhost`에서 저장 불가) | `HttpOnly; Secure` |
| `mocks/lib/jwt.ts` | `alg: none` + 고정 문자열 서명 | 서버가 비밀키로 서명 |
| `mocks/lib/auth-guard.ts` | `exp`만 확인 | 서명 검증이 먼저 |
| `mocks/data/db.ts` | 비밀번호 평문 비교 | 해시 비교 |
| `mocks/data/db.ts` | `sessionStorage`에 목 데이터 영속화 | 서버 DB |
| `mocks/lib/delay.ts` | 인위적 네트워크 지연 삽입 | 실제 네트워크 지연 |

**타협 지점에는 `//- 프로덕션과 다름.` 주석을 단다.** 무엇을 가정했는지와 실제라면 어떻게 되는지만 한두 줄로 적고, 긴 근거는 이 표에 둔다. `git grep "프로덕션과 다름"`이 코드 쪽 목록이며, 위 표와 개수가 일치해야 한다. 이 예외는 목 계층과 목 때문에 앱 코드가 타협한 자리에만 적용한다.

### 3.5 MSW의 쿠키 저장소

쿠키는 `document.cookie`와 MSW 자체 저장소(`localStorage['__msw-cookie-store__']`) 두 군데에 저장되고, **요청 시에는 저장소 쪽이 우선한다.** 클라이언트에서 `document.cookie`만 지우면 저장소 토큰이 남는다 — 쿠키를 확실히 지우려면 서버 응답(`Set-Cookie: … Max-Age=0`)으로 내려야 두 저장소가 함께 정리된다.

### 3.6 테스트에서의 사용

- 오류·지연·상태 변화 시뮬레이션은 테스트 안의 `server.use(http.…)` 인라인 오버라이드로 한다. 핸들러에서 `undefined`를 반환하면 기본 핸들러로 폴스루된다.
- `src/mocks/handlers.test.ts`는 React 없이 맨 `fetch`로 목 API의 계약을 검사한다.
- 테스트는 `mocks/`를 직접 import하지 않고 `test-utils.tsx`의 재export(`TEST_ACCOUNT`)를 쓴다. `mocks/`는 FSD 레이어 밖이다.

---

## 4. UI 상태 컨벤션

### 4.1 한 줄 요약

실패 **문구**는 전역 에러 모달 하나가 책임진다. 화면은 **그 자리를 무엇으로 채울지**(스켈레톤 / 재시도 / 안내 화면)만 결정한다.

| 상태 | 표현 | 담당 |
| --- | --- | --- |
| 로딩 | 화면 형태를 닮은 스켈레톤 | `QueryBoundary`의 `skeleton` |
| 실패 (데이터 없음) | "다시 시도" 버튼 + 전역 모달의 사유 문구 | `ErrorState` + `QueryCache.onError` |
| 실패 (데이터 있음) | 기존 데이터 유지 + 하단 재시도 (모달 억제, `role="alert"`) | 목록 화면 자체 분기 |
| 401 (세션 만료) | 로그인 안내 화면 (모달 없음) | `AuthGate` |
| 404 (상세 조회) | 404 전용 화면 + 목록 복귀 버튼 (모달 없음) | `TaskNotFound` |
| 빈 목록 | "등록된 할 일이 없습니다." 안내 화면 | 목록 화면 자체 분기 |

**안내 화면은 `MessagePanel` 하나로 그린다**(빈 목록, 세션 만료). 문구를 화면마다 다른 마크업으로 두지 않는다. 예외는 404뿐이며 `NotFoundPanel`을 쓴다 — 숫자 표식과 복귀 버튼이 있어 형태가 다르다.

토스트는 쓰지 않는다. 실패 통지는 전역 모달, 성공 통지는 화면 이동 그 자체다.

### 4.2 전역 에러 모달

- `QueryCache.onError`/`MutationCache.onError`(`app/query-client.ts`)가 `errorModalStore.show(toErrorMessage(error))`를 호출하고, 앱 루트에 한 번 마운트된 `ErrorModal`이 그린다. 화면마다 모달을 두지 않는다.
- 노출 판정(`shouldOpenErrorModal`)은 순수 함수로 분리해 단위 테스트한다. 예외는 셋뿐이다:

| 예외 | 처리 주체 |
| --- | --- |
| `AbortError` (화면 이탈로 우리가 취소한 요청) | 통지 없음 |
| 인증 요청의 401 (`HttpError.authenticated`) | `AuthGate` 화면 전환 |
| 쿼리의 404 | `TaskNotFound` 화면 |

- **뮤테이션의 404는 예외가 아니다** — 모달을 띄운다.
- **`meta: { hasInlineErrorUi: true }` 쿼리는 화면에 데이터가 있는 동안 모달을 띄우지 않는다**(`isSilentQueryError`). 대신 목록 하단에 인라인 재시도(`ErrorState`)를 붙인다. 첫 페이지부터 실패하면 일반 규칙대로 모달이 뜬다.
- **`ErrorState`가 그리는 보이는 요소는 "다시 시도" 버튼뿐이다.** 화면에 보이는 실패 문구는 어디서든 전역 모달의 책임이다. 다만 `role="alert"`과 스크린리더 전용(`sr-only`) 사유 문구를 함께 낸다 — 모달이 억제되는 무한 스크롤 실패도 보조기술에는 전달되어야 한다. 사유 문구는 `message` prop으로 화면이 정한다.
- **모달은 한 번에 하나다**(`errorModalStore`). 표시 중이면 뒤에 온 메시지는 버리고 개발 모드에서만 콘솔에 남긴다.

### 4.3 로딩과 실패 분기의 위치

분기는 `shared/ui/query-boundary.tsx` 한 곳에 모은다.

```tsx
<QueryBoundary query={profile} skeleton={<UserSkeleton />}>
  {(data) => <UserProfileCard user={data} />}
</QueryBoundary>
```

- `isPending` → 스켈레톤
- `isError && data === undefined` → `ErrorState`
- 그 외 → `children(data)`. 이 지점에서 `data`는 확정이므로 **화면 컴포넌트는 `undefined` 분기를 갖지 않는다.** `data`가 있는 에러는 통과시켜 이전 데이터를 유지한다.

**Suspense와 ErrorBoundary는 데이터 상태에 쓰지 않는다.** 한 화면의 세 상태를 한 컴포넌트 안에서 순서대로 읽는다. `Suspense`는 devtools 지연 로딩 한 곳뿐이다.

### 4.4 스켈레톤

- **스피너는 없다. 로딩은 전부 스켈레톤이다.** 화면마다 `*-skeleton.tsx`를 두고, 실제 컴포넌트와 마크업을 공유하는 `*Shell` 서브 컴포넌트로 최종 형태를 닮게 만든다.
- 스크린리더에는 `role="status"` + `aria-busy="true"` + `aria-label`("…를 불러오는 중")로 알린다. 테스트는 `getByRole('status')`로 검사한다.
- 무한 스크롤의 다음 페이지 로딩은 **목록 하단에 카드 한 장짜리 스켈레톤**만 붙이고, 알림 방식은 페이지 스켈레톤과 같다(`role="status"` + `aria-busy` + `aria-label`).

### 4.5 재시도

```ts
const retry = () => void (list.isFetchNextPageError ? list.fetchNextPage() : list.refetch())
```

- **다음 페이지 실패는 `fetchNextPage`, 첫 로딩 실패는 `refetch`.** 구분 없이 `refetch`만 걸면 쌓인 페이지를 전부 다시 받는다.
- 다음 페이지 호출 시점은 순수 함수 `shouldLoadMore`로 분리해 단위 테스트한다. 조건에 `hasError`가 들어 있어 **실패 후에는 스크롤로 재요청이 반복되지 않는다** — 재개는 반드시 재시도 버튼을 거친다.

### 4.6 세션 상태의 표현

| 상태 | 표현 |
| --- | --- |
| `restoring` | 스켈레톤 (`aria-label="세션을 확인하는 중"`) |
| `unauthenticated` | "이 화면은 로그인 후 볼 수 있는 화면입니다." + 로그인 버튼 (`MessagePanel`) |
| `authenticated` | 화면 그대로 |

- **`restoring`은 별도 상태다.** 새로고침 직후 refresh 복원 구간을 `unauthenticated`로 묶으면 로그인 안내가 스쳐 지나간다.
- **refresh 실패 시 `/sign-in`으로 이동시키지 않는다.** 토큰만 폐기하고 주소를 유지한 채 `AuthGate` 안내로 바꾼다.
- **로그아웃(명시적 행위)은 `/sign-in`으로 이동시킨다**(순서 → [2.5절](#25-캐시-갱신-정책)).
- 클라이언트 상태는 전부 **모듈 스코프 스토어 + `useSyncExternalStore`** 다(`token-store`, `session-store`, `error-modal-store`). 상태 라이브러리는 들이지 않는다.

### 4.7 폼 유효성 표시

**검증 시점과 표시 시점을 분리한다.**

| 대상 | 시점 |
| --- | --- |
| 검증 실행 | `mode: 'onChange'` — 입력마다 |
| 오류 표시 | 해당 필드가 `touched`(blur 이후)일 때만 |
| 제출 버튼 | `isValid`에 따라 항상 즉시 활성/비활성 |

```tsx
const emailError = touchedFields.email ? errors.email : undefined
```

- 표시 게이트는 문구·`aria-invalid`·`data-invalid`·`aria-describedby`에 **같은 조건으로** 건다.
- **입력 규칙은 `placeholder`로 상시 안내한다**(비밀번호 `영문, 숫자 8~24자`). blur 전에는 오류 문구가 없어 제출 버튼이 잠긴 이유를 알 수 없기 때문이다. 별도의 `FieldDescription`은 두지 않는다.
- 공통 규칙: react-hook-form + `zodResolver`, 명시적 `defaultValues`, `{...register(name)}` 비제어(`<Controller>` 없음), `<form noValidate>`, 제출 버튼은 `disabled={!isValid || isPending}`. 진행 중 표시는 버튼 비활성뿐, 스피너·라벨 교체는 없다.
- **삭제 확인 입력은 오류 문구를 두지 않는다.** 정답이 하나뿐이라 "틀렸다"가 무의미하고, 입력할 값은 `DialogDescription`이 말한다. 신호는 비활성 제출 버튼이다.

### 4.8 다이얼로그의 수명

- 삭제 확인 다이얼로그는 **결과와 무관하게 닫는다**(`onSettled`로 닫기 콜백 전달). 성공은 목록 이동, 404는 404 화면 전환, 5xx는 상세 유지 + 전역 모달.
- 열림/닫힘은 소유 컴포넌트의 로컬 `useState`이고, `onOpenChange`에서 폼을 `reset()`한다.

### 4.9 모달의 표현

전역 에러 모달은 Radix Dialog 기반으로 닫기 아이콘을 숨기고(`showCloseButton={false}`) **"확인" 버튼 하나만 둔다** — 닫는 경로가 하나여야 사용자가 확인했다는 사실이 분명하다. 제목은 `오류`, 접근 가능한 설명이 곧 서버의 `errorMessage`다.
