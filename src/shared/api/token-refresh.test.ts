import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { httpClient } from './http-client'
import { HttpError } from './http-error'
import { tokenStore } from './token-store'

afterEach(() => {
  tokenStore.clear()
})

describe('401 refresh 단일화', () => {
  it('동시 다발 401에도 refresh는 1회만 수행하고 전원 재시도에 성공한다', async () => {
    tokenStore.set('expired-token')
    let refreshCount = 0
    server.use(
      http.get('/api/protected', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({ errorMessage: '인증이 만료되었습니다' }, { status: 401 }),
      ),
      http.post('/api/refresh', async () => {
        refreshCount += 1
        await delay(50)
        return HttpResponse.json({ accessToken: 'fresh-token', refreshToken: 'rotated' })
      }),
    )

    const results = await Promise.all([
      httpClient.get<{ ok: boolean }>('/api/protected'),
      httpClient.get<{ ok: boolean }>('/api/protected'),
      httpClient.get<{ ok: boolean }>('/api/protected'),
    ])

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }])
    expect(refreshCount).toBe(1)
    expect(tokenStore.get()).toBe('fresh-token')
  })

  it('refresh 실패 시 원 요청은 HttpError(401)로 실패하고 토큰이 클리어된다', async () => {
    tokenStore.set('expired-token')
    server.use(
      http.get('/api/protected', () =>
        HttpResponse.json({ errorMessage: '인증이 만료되었습니다' }, { status: 401 }),
      ),
      http.post('/api/refresh', () =>
        HttpResponse.json({ errorMessage: 'refresh token이 만료되었습니다' }, { status: 401 }),
      ),
    )

    const error = await httpClient.get('/api/protected').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).status).toBe(401)
    expect(tokenStore.get()).toBeNull()
  })

  it('refresh 성공 후 재시도도 401이면 추가 refresh 없이 종료한다', async () => {
    tokenStore.set('expired-token')
    let protectedCalls = 0
    let refreshCount = 0
    server.use(
      http.get('/api/protected', () => {
        protectedCalls += 1
        return HttpResponse.json({ errorMessage: '권한이 없습니다' }, { status: 401 })
      }),
      http.post('/api/refresh', () => {
        refreshCount += 1
        return HttpResponse.json({ accessToken: 'fresh-token', refreshToken: 'rotated' })
      }),
    )

    await expect(httpClient.get('/api/protected')).rejects.toBeInstanceOf(HttpError)
    expect(protectedCalls).toBe(2)
    expect(refreshCount).toBe(1)
  })

  it('auth: false 요청은 401이어도 refresh를 시도하지 않는다', async () => {
    let refreshCount = 0
    server.use(
      http.get('/api/protected', () =>
        HttpResponse.json({ errorMessage: '인증이 필요합니다' }, { status: 401 }),
      ),
      http.post('/api/refresh', () => {
        refreshCount += 1
        return HttpResponse.json({ accessToken: 'fresh-token', refreshToken: 'rotated' })
      }),
    )

    await expect(httpClient.get('/api/protected', { auth: false })).rejects.toBeInstanceOf(
      HttpError,
    )
    expect(refreshCount).toBe(0)
  })
})
