import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

async function loadGate() {
  const { AuthGate } = await import('./auth-gate')
  const { bootstrapSession } = await import('../model/session-store')
  return { AuthGate, bootstrapSession }
}

function renderGate(AuthGate: (props: { children: ReactNode }) => ReactNode) {
  return render(<AuthGate>보호된 콘텐츠</AuthGate>)
}

describe('AuthGate', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('세션을 복원하는 동안에는 스켈레톤만 보여준다', async () => {
    const { AuthGate } = await loadGate()

    renderGate(AuthGate)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument()
  })

  it('복원에 실패하면 리다이렉트 없이 로그인 안내 화면을 콘텐츠 자리에 그린다', async () => {
    server.use(
      http.post('/api/refresh', () =>
        HttpResponse.json({ errorMessage: 'refresh token이 유효하지 않습니다' }, { status: 401 }),
      ),
    )
    const { AuthGate, bootstrapSession } = await loadGate()
    await bootstrapSession()

    renderGate(AuthGate)

    expect(screen.getByText('이 화면은 로그인 후 볼 수 있는 화면입니다.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '로그인 하러 가기' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument()
  })

  it('복원에 성공하면 children 을 그대로 그린다', async () => {
    server.use(
      http.post('/api/refresh', () =>
        HttpResponse.json({ accessToken: 'access-token', refreshToken: 'refresh-token' }),
      ),
    )
    const { AuthGate, bootstrapSession } = await loadGate()
    await bootstrapSession()

    renderGate(AuthGate)

    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
