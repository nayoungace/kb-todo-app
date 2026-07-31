import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { httpClient } from './http-client'
import { HttpError } from './http-error'
import { tokenStore } from './token-store'

afterEach(() => {
  tokenStore.clear()
})

describe('httpClient', () => {
  it('params를 URLSearchParams로 직렬화하고 undefined 값은 제외한다', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/echo', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ ok: true })
      }),
    )

    await httpClient.get('/api/echo', { params: { page: 1, done: true, keyword: undefined } })

    expect(new URL(capturedUrl).search).toBe('?page=1&done=true')
  })

  it('비정상 응답을 body의 errorMessage로 정규화한 HttpError로 throw한다', async () => {
    server.use(
      http.get('/api/echo', () =>
        HttpResponse.json({ errorMessage: '잘못된 요청' }, { status: 400 }),
      ),
    )

    const error = await httpClient.get('/api/echo').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).status).toBe(400)
    expect((error as HttpError).message).toBe('잘못된 요청')
  })

  it('JSON이 아닌 에러 body는 상태 코드 폴백 메시지를 사용한다', async () => {
    server.use(http.get('/api/echo', () => new HttpResponse('Internal Error', { status: 500 })))

    const error = await httpClient.get('/api/echo').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).message).toBe('HTTP 500')
  })

  it('204 no-content 응답은 undefined를 반환한다', async () => {
    server.use(http.delete('/api/task/1', () => new HttpResponse(null, { status: 204 })))

    await expect(httpClient.delete('/api/task/1')).resolves.toBeUndefined()
  })

  it('기본으로 tokenStore의 accessToken을 Bearer로 주입한다', async () => {
    tokenStore.set('access-token')
    let authHeader: string | null = null
    server.use(
      http.get('/api/echo', ({ request }) => {
        authHeader = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await httpClient.get('/api/echo')

    expect(authHeader).toBe('Bearer access-token')
  })

  it('auth: false면 Authorization을 붙이지 않는다', async () => {
    tokenStore.set('access-token')
    let authHeader: string | null = null
    server.use(
      http.post('/api/sign-in', ({ request }) => {
        authHeader = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )

    await httpClient.post('/api/sign-in', { body: {}, auth: false })

    expect(authHeader).toBeNull()
  })

  it('abort 시 HttpError로 정규화하지 않고 AbortError를 그대로 전파한다', async () => {
    server.use(
      http.get('/api/echo', async () => {
        await delay(100)
        return HttpResponse.json({ ok: true })
      }),
    )

    const controller = new AbortController()
    const promise = httpClient.get('/api/echo', { signal: controller.signal })
    controller.abort()

    const error = await promise.catch((e: unknown) => e)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).name).toBe('AbortError')
    expect(error).not.toBeInstanceOf(HttpError)
  })
})
