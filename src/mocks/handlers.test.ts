import { describe, expect, it } from 'vitest'
import { SEED_ACCOUNT } from './data/db'
import { createFakeJwt } from './lib/jwt'

function apiUrl(path: string): URL {
  return new URL(path, window.location.origin)
}

function validAuthHeaders(): Record<string, string> {
  const token = createFakeJwt({ id: SEED_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) + 60 })
  return { Authorization: `Bearer ${token}` }
}

function signIn(body: unknown): Promise<Response> {
  return fetch(apiUrl('/api/sign-in'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('MSW 핸들러', () => {
  it('refresh: 쿠키가 없으면 401을 반환한다', async () => {
    const response = await fetch(apiUrl('/api/refresh'), { method: 'POST' })

    expect(response.status).toBe(401)
  })

  it('sign-in: 시드 계정 불일치 시 400과 errorMessage를 반환한다', async () => {
    const response = await signIn({ email: SEED_ACCOUNT.email, password: 'wrongpass1' })

    expect(response.status).toBe(400)
    const body = (await response.json()) as { errorMessage: string }
    expect(body.errorMessage).toBeTruthy()
  })

  it('sign-in: 시드 계정 일치 시 토큰 쌍과 refresh 쿠키(Set-Cookie)를 내려준다', async () => {
    const response = await signIn({ email: SEED_ACCOUNT.email, password: SEED_ACCOUNT.password })

    expect(response.status).toBe(200)
    const body = (await response.json()) as { accessToken: string; refreshToken: string }
    expect(body.accessToken.split('.')).toHaveLength(3)
    expect(body.refreshToken.split('.')).toHaveLength(3)
    expect(response.headers.get('Set-Cookie')).toContain('token=')
  })

  it('refresh: sign-in으로 심긴 쿠키로 새 토큰 쌍을 발급한다', async () => {
    await signIn({ email: SEED_ACCOUNT.email, password: SEED_ACCOUNT.password })

    const response = await fetch(apiUrl('/api/refresh'), {
      method: 'POST',
      credentials: 'include',
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as { accessToken: string }
    expect(body.accessToken.split('.')).toHaveLength(3)
  })

  it('보호 API는 Bearer 토큰이 없으면 401을 반환한다', async () => {
    const response = await fetch(apiUrl('/api/task?page=1'))

    expect(response.status).toBe(401)
  })

  it('만료된 accessToken은 401로 거부한다', async () => {
    const expired = createFakeJwt({ id: SEED_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) - 1 })
    const response = await fetch(apiUrl('/api/user'), {
      headers: { Authorization: `Bearer ${expired}` },
    })

    expect(response.status).toBe(401)
  })

  it('task 목록: page 파라미터가 없으면 400을 반환한다', async () => {
    const response = await fetch(apiUrl('/api/task'), { headers: validAuthHeaders() })

    expect(response.status).toBe(400)
  })

  it('task 목록: page size 20으로 페이지네이션하고 마지막 페이지에서 hasNext가 false다', async () => {
    const first = await fetch(apiUrl('/api/task?page=1'), { headers: validAuthHeaders() })
    const firstBody = (await first.json()) as { data: { id: number }[]; hasNext: boolean }
    expect(firstBody.data).toHaveLength(20)
    expect(firstBody.hasNext).toBe(true)

    const last = await fetch(apiUrl('/api/task?page=11'), { headers: validAuthHeaders() })
    const lastBody = (await last.json()) as { data: { id: number }[]; hasNext: boolean }
    expect(lastBody.data).toHaveLength(20)
    expect(lastBody.hasNext).toBe(false)
  })

  it('task 상세: 존재하지 않는 id는 404를 반환한다', async () => {
    const response = await fetch(apiUrl('/api/task/99999'), { headers: validAuthHeaders() })

    expect(response.status).toBe(404)
  })

  it('task 삭제: 삭제 후 상세 조회가 404가 되고 대시보드 집계에 반영된다', async () => {
    const deleted = await fetch(apiUrl('/api/task/1'), {
      method: 'DELETE',
      headers: validAuthHeaders(),
    })
    expect(deleted.status).toBe(200)
    expect((await deleted.json()) as { success: boolean }).toEqual({ success: true })

    const detail = await fetch(apiUrl('/api/task/1'), { headers: validAuthHeaders() })
    expect(detail.status).toBe(404)

    const dashboard = await fetch(apiUrl('/api/dashboard'), { headers: validAuthHeaders() })
    const counts = (await dashboard.json()) as { numOfTask: number }
    expect(counts.numOfTask).toBe(219)
  })
})
