import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { establishSession } from '@/entities/session'
import { createFakeJwt } from '@/mocks/lib/jwt'
import { routeTree } from '@/routeTree.gen'
import { tokenStore } from '@/shared/api'
import { TEST_ACCOUNT } from '@/test/test-utils'
import { queryClient } from './query-client'

const FIND_TIMEOUT = { timeout: 5000 }

function renderApp(initialPath: string) {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return router
}

beforeEach(() => {
  document.cookie = `token=${createFakeJwt({ id: TEST_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) + 600 })}; Path=/`
  establishSession({
    accessToken: createFakeJwt({ id: TEST_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) + 60 }),
    refreshToken: 'test-refresh',
  })
})

afterEach(() => {
  queryClient.clear()
})

describe('회원정보 페이지의 로그아웃', () => {
  it('로그인 화면으로 이동하고 토큰·refresh 쿠키·쿼리 캐시를 모두 버린다', async () => {
    const user = userEvent.setup()
    const router = renderApp('/user')

    expect(await screen.findByText(TEST_ACCOUNT.name, undefined, FIND_TIMEOUT)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: '로그아웃' }, FIND_TIMEOUT))

    expect(
      await screen.findByRole('heading', { level: 1, name: '로그인' }, FIND_TIMEOUT),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(tokenStore.get()).toBeNull()
    expect(document.cookie).not.toContain('token=')
    await waitFor(() => expect(queryClient.getQueryCache().getAll()).toHaveLength(0), FIND_TIMEOUT)
  })

  it('로그아웃하면 refresh 쿠키가 서버에서도 무효화되어 세션을 되살릴 수 없다', async () => {
    const signInResponse = await fetch(new URL('/api/sign-in', window.location.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }),
    })
    expect(signInResponse.status).toBe(200)

    const user = userEvent.setup()
    renderApp('/user')

    await user.click(await screen.findByRole('button', { name: '로그아웃' }, FIND_TIMEOUT))
    await screen.findByRole('heading', { level: 1, name: '로그인' }, FIND_TIMEOUT)

    await waitFor(async () => {
      const refreshResponse = await fetch(new URL('/api/refresh', window.location.origin), {
        method: 'POST',
      })
      expect(refreshResponse.status).toBe(401)
    }, FIND_TIMEOUT)
  })
})
