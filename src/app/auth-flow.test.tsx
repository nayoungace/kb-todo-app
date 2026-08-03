import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthGate, establishSession } from '@/entities/session'
import { server } from '@/mocks/server'
import { UserPage } from '@/pages/user'
import { tokenStore } from '@/shared/api'
import { errorModalStore } from '@/shared/lib/error-modal-store'
import { ErrorModal } from '@/shared/ui/error-modal'
import { renderWithProviders } from '@/test/test-utils'
import { queryClient } from './query-client'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

beforeEach(() => {
  establishSession({ accessToken: 'expired-token', refreshToken: 'expired-refresh' })
})

afterEach(() => {
  errorModalStore.close()
  queryClient.clear()
})

describe('보호 화면의 세션 만료', () => {
  it('갱신에 실패한 401은 모달 없이 로그인 안내 화면으로 바뀐다', async () => {
    server.use(
      http.get('/api/user', () =>
        HttpResponse.json({ errorMessage: '인증이 필요합니다' }, { status: 401 }),
      ),
      http.post('/api/refresh', () =>
        HttpResponse.json({ errorMessage: 'refresh token이 유효하지 않습니다' }, { status: 401 }),
      ),
    )

    renderWithProviders(
      <>
        <AuthGate>
          <UserPage />
        </AuthGate>
        <ErrorModal />
      </>,
      queryClient,
    )

    expect(
      await screen.findByText('이 화면은 로그인 후 볼 수 있는 화면입니다.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '로그인 하러 가기' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
    expect(tokenStore.get()).toBeNull()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('갱신에 성공하면 안내 화면 없이 회원정보를 그린다', async () => {
    let userCalls = 0
    server.use(
      http.get('/api/user', ({ request }) => {
        userCalls += 1
        return request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ name: '홍길동', memo: '갱신 후 응답' })
          : HttpResponse.json({ errorMessage: '인증이 필요합니다' }, { status: 401 })
      }),
      http.post('/api/refresh', () =>
        HttpResponse.json({ accessToken: 'fresh-token', refreshToken: 'rotated' }),
      ),
    )

    renderWithProviders(
      <>
        <AuthGate>
          <UserPage />
        </AuthGate>
        <ErrorModal />
      </>,
      queryClient,
    )

    expect(await screen.findByText('갱신 후 응답')).toBeInTheDocument()
    await waitFor(() => {
      expect(userCalls).toBe(2)
    })
    expect(screen.queryByText('이 화면은 로그인 후 볼 수 있는 화면입니다.')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
