import { QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { establishSession } from '@/entities/session'
import { createTestQueryClient } from '@/test/test-utils'
import { AppShell } from './app-shell'

function renderAppShell(initialPath: string) {
  const rootRoute = createRootRoute()
  const shellRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'shell',
    component: AppShell,
  })
  const taskRoute = createRoute({
    getParentRoute: () => shellRoute,
    path: '/task',
    component: () => <h1>할 일</h1>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([shellRoute.addChildren([taskRoute])]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  establishSession({ accessToken: 'test-token', refreshToken: 'test-refresh' })
})

describe('AppShell 랜드마크', () => {
  it('헤더는 banner, 콘텐츠는 main 이다', async () => {
    renderAppShell('/task')
    await screen.findByRole('heading', { level: 1, name: '할 일' })

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: '할 일' }),
    )
  })

  it('내비게이션은 이름으로 구분된다', async () => {
    renderAppShell('/task')
    await screen.findByRole('heading', { level: 1, name: '할 일' })

    expect(screen.getByRole('navigation', { name: '주요 메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '사이드 메뉴' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: '계정' })).toBeInTheDocument()
  })

  it('첫 번째 링크는 본문으로 건너뛰는 스킵 링크다', async () => {
    renderAppShell('/task')
    await screen.findByRole('heading', { level: 1, name: '할 일' })

    const skipLink = screen.getAllByRole('link')[0]
    expect(skipLink).toHaveAccessibleName('본문으로 건너뛰기')
    expect(skipLink).toHaveAttribute('href', `#${screen.getByRole('main').id}`)
  })
})
