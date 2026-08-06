import { http, HttpResponse } from 'msw'
import { SEED_ACCOUNT } from '../data/db'
import { networkDelay } from '../lib/delay'
import { createFakeJwt, decodeJwt, isExpired } from '../lib/jwt'

//- 프로덕션과 다름. 401 → refresh → 재시도 경로를 검수자가 직접 관찰할 수 있도록 TTL을 30초로 줄였다.
//  실제 환경이라면 수 분 단위다.
export const ACCESS_TOKEN_TTL_SECONDS = 30
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

function issueTokens() {
  return {
    accessToken: createFakeJwt({
      id: SEED_ACCOUNT.id,
      exp: nowSeconds() + ACCESS_TOKEN_TTL_SECONDS,
    }),
    refreshToken: createFakeJwt({
      id: SEED_ACCOUNT.id,
      exp: nowSeconds() + REFRESH_TOKEN_TTL_SECONDS,
    }),
  }
}

//- 프로덕션과 다름. `Secure`는 http://localhost 에서 저장되지 않고, `HttpOnly`는 목이 심어도
//  MSW 쿠키 저장소 특성상 의미가 없어 둘 다 뺐다. 실제 환경이라면 `HttpOnly; Secure`가 붙는다.
function refreshCookie(refreshToken: string): string {
  return `token=${refreshToken}; Path=/; Max-Age=${REFRESH_TOKEN_TTL_SECONDS}; SameSite=Strict`
}

export const authHandlers = [
  http.post('/api/sign-in', async ({ request }) => {
    await networkDelay()

    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email !== SEED_ACCOUNT.email || body.password !== SEED_ACCOUNT.password) {
      return HttpResponse.json(
        { errorMessage: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 400 },
      )
    }

    const tokens = issueTokens()
    return HttpResponse.json(tokens, {
      headers: { 'Set-Cookie': refreshCookie(tokens.refreshToken) },
    })
  }),

  //- 프로덕션과 다름. 명세에 없는 목 전용 엔드포인트다. 실제 환경이라면 refresh 쿠키가 HttpOnly 라
  //  클라이언트가 지울 수 없으므로 명세에 서버 무효화 엔드포인트가 있어야 하고, 목에서도 MSW 쿠키 저장소는
  //  만료 Set-Cookie 응답으로만 정리된다(→ conventions §3.5).
  http.post('/api/sign-out', async () => {
    await networkDelay()

    return new HttpResponse(null, {
      status: 204,
      headers: { 'Set-Cookie': 'token=; Path=/; Max-Age=0; SameSite=Strict' },
    })
  }),

  http.post('/api/refresh', async ({ cookies }) => {
    await networkDelay()

    const refreshToken = cookies['token']
    const payload = refreshToken ? decodeJwt(refreshToken) : null
    if (!payload || isExpired(payload)) {
      return HttpResponse.json(
        { errorMessage: 'refresh token이 유효하지 않습니다' },
        { status: 401 },
      )
    }

    const tokens = issueTokens()
    return HttpResponse.json(tokens, {
      headers: { 'Set-Cookie': refreshCookie(tokens.refreshToken) },
    })
  }),
]
