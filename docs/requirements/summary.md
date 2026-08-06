# 요구사항 요약

요구사항을 표로 정리한 문서. 충돌 시 API 전문은 openapi.yaml (OAS 3.1) 기준을 우선함.

## 1. 설명

| 항목       | 내용                                                       |
| ---------- | ---------------------------------------------------------- |
| 필수 스택  | React 18/19 + TypeScript                                   |
| 그 외 라이브러리 | 자유 선택 (선택 근거는 개발자 판단)                   |
| 아이콘     | 항목별로 겹치지 않게 지정, 심미성 평가 대상 아님            |
| 색상       | 토큰으로 관리 (예: primary: blue, disabled: gray)       |
| 폰트       | Pretendard                                                 |
| API 서버   | 별도 서버 / 함수 레벨 mocking / MSW 등 자유, 구현 코드도 제출 |
| 미정 사항  | 자의적으로 결정 후 코멘트 남기거나 질문 (답변은 비실시간)   |
| AI 사용 시 | AI_USAGE.md 제출 (가산점, 미제출 감점 없음)               |

### AI_USAGE.md 항목

| 구분 | 내용                                                            |
| ---- | --------------------------------------------------------------- |
| 필수 | 사용 도구/모델, 적용 작업 범위, 핵심 프롬프트 요약, 사람의 최종 검증 내용 |
| 선택 | 전체 프롬프트 원문, subagent 설정, 계획 문서                     |
| 주의 | 비밀정보(API 키, 개인/조직 민감정보) 제거 후 제출                |

## 2. 페이지

| 화면       | 라우트       | API            | 핵심 요구사항                                                                 |
| ---------- | ------------ | --------------------- | ----------------------------------------------------------------------------- |
| GNB/LNB    | -            | -                     | 대시보드, 할 일 라우트 링크(각 아이콘), 로그인 상태에 따라 회원정보/로그인 아이콘 분기 |
| 대시보드   | /          | 기재 없음           | 일(numOfTask), 해야할 일(numOfRestTask), 한 일(numOfDoneTask) 갯수 표기   |
| 로그인     | /sign-in   | [POST] /api/sign-in   | 폼 제출, 유효성 검증 표시, 실패 시 errorMessage 모달                          |
| 목록       | /task      | [GET] /api/task       | 카드 목록(title, memo), 가상 스크롤링(화면에 보여지는 요소 또는 보여질 요소만 렌더), 무한 스크롤(목록 끝에 도달하는 경우 다음 페이지 호출), 카드 클릭 시 상세 이동 |
| 상세       | /task/:id  | [GET] /api/task/:id   | 상세 표시, 404 전용 화면(목록 복귀 버튼), 삭제 확인 모달                        |
| 회원정보   | -            | [GET] /api/user       | 결과 표시                                                                     |


### 로그인 폼

| 요소     | 규칙                                              | 필수 |
| -------- | ------------------------------------------------- | ---- |
| email    | email 규약에 맞는 문자열                           | O    |
| 비밀번호 | 영문, 숫자로 구성된 8~24자 문자열                    | O    |
| 제출     | 두 조건 모두 만족 시 활성화, 아니면 비활성화        | -    |

- 모든 input에 label 표기 필수
- 유효성 검증이 통과되지 않으면 적절히 표시
- 응답 status 200이 아닐 경우 errorMessage 모달

### 상세 화면 삭제 플로우

| 단계 | 동작                                                          |
| ---- | ------------------------------------------------------------- |
| 1    | 삭제 버튼 클릭 → 확인용 input을 포함해서 모달               |
| 2    | input 값이 해당 task id와 다르면 → 제출 버튼 비활성화       |
| 3    | input 값이 id와 같고 + 제출 클릭 → 목록으로 redirect        |

## 3. API 엔드포인트

| Method | Path             | 인증          | 파라미터                 | 성공(200)            | 실패                |
| ------ | ---------------- | ------------- | ------------------------ | -------------------- | ------------------- |
| POST   | /api/sign-in   | -             | body: SignInRequest    | AuthTokenResponse  | 400                 |
| POST   | /api/refresh   | refresh cookie | -                       | AuthTokenResponse  | 400, 401            |
| GET    | /api/user      | Bearer        | -                        | UserResponse       | 401                 |
| GET    | /api/dashboard | Bearer        | -                        | DashboardResponse  | 401                 |
| GET    | /api/task      | Bearer        | query page (int, >=1, 필수) | TaskListResponse | 401                 |
| GET    | /api/task/{id} | Bearer        | path id (string)       | TaskDetailResponse | 401, 404            |
| DELETE | /api/task/{id} | Bearer        | path id (string)       | DeleteTaskResponse | 401, 404            |

### 인증

| 이름                 | 방식                          | 비고                                        |
| -------------------- | ----------------------------- | ------------------------------------------- |
| bearerAuth         | HTTP Bearer (JWT)             | 전체 API 적용                |
| refreshTokenCookie | Cookie token                | credentials 포함하여 요청     |

- 응답 헤더 명세 없음

## 4. 스키마

전부 additionalProperties: false 이며 password(8~24)는 길이 제한 있음 / title 과 memo 에는 길이 제한 없음

| 스키마                | 필드 (전부 required)                                        |
| --------------------- | ----------------------------------------------------------- |
| SignInRequest       | email (format: email), password (8~24, ^[A-Za-z0-9]+$) |
| AuthTokenResponse   | accessToken, refreshToken (JWT, payload에 id/exp)    |
| UserResponse        | name, memo                                              |
| DashboardResponse   | numOfTask, numOfRestTask, numOfDoneTask (integer)      |
| TaskItem            | id, title, memo, status (TODO \| DONE)           |
| TaskListResponse    | data (TaskItem[]), hasNext (boolean)                   |
| TaskDetailResponse  | title, memo, registerDatetime (date-time)              |
| DeleteTaskResponse  | success (const true)                                     |
| ErrorResponse       | errorMessage (string)                                      |