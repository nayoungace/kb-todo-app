import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { establishSession } from '@/entities/session'
import { taskQueries } from '@/entities/task'
import { createFakeJwt } from '@/mocks/lib/jwt'
import { server } from '@/mocks/server'
import { routeTree } from '@/routeTree.gen'
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

async function deleteTask(
  user: ReturnType<typeof userEvent.setup>,
  seq: string,
  typed: string = seq,
) {
  await user.click(await screen.findByText(`할 일 ${seq}`, undefined, FIND_TIMEOUT))
  await user.click(await screen.findByRole('button', { name: '삭제' }, FIND_TIMEOUT))
  await user.type(await screen.findByLabelText('할 일 id', undefined, FIND_TIMEOUT), typed)
  await waitFor(
    () => expect(screen.getByRole('button', { name: '제출' })).toBeEnabled(),
    FIND_TIMEOUT,
  )
  await user.click(screen.getByRole('button', { name: '제출' }))
}

beforeEach(() => {
  establishSession({
    accessToken: createFakeJwt({ id: TEST_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) + 60 }),
    refreshToken: 'test-refresh',
  })
})

afterEach(() => {
  queryClient.clear()
})

describe('할 일 삭제 후 목록 복귀', () => {
  it('삭제한 항목은 목록에 남지 않는다', async () => {
    const user = userEvent.setup()
    renderApp('/task')

    await deleteTask(user, '4')

    expect(
      await screen.findByRole('heading', { level: 1, name: '할 일' }, FIND_TIMEOUT),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('할 일 5')).toBeInTheDocument(), FIND_TIMEOUT)
    expect(screen.queryByText('할 일 4')).not.toBeInTheDocument()
  })

  it('확인 입력의 앞뒤 공백은 무시하고 삭제를 진행한다', async () => {
    const user = userEvent.setup()
    renderApp('/task')

    await deleteTask(user, '6', '  6  ')

    expect(
      await screen.findByRole('heading', { level: 1, name: '할 일' }, FIND_TIMEOUT),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('할 일 6')).not.toBeInTheDocument(), FIND_TIMEOUT)
  })

  it('이미 사라진 항목의 삭제가 404로 실패하면 상세 캐시를 버리고 404 화면으로 바꾼다', async () => {
    let removed = false
    server.use(
      http.delete('/api/task/:id', () => {
        removed = true
        return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다' }, { status: 404 })
      }),
      http.get('/api/task/:id', () =>
        removed
          ? HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다' }, { status: 404 })
          : undefined,
      ),
    )

    const user = userEvent.setup()
    const router = renderApp('/task')

    await deleteTask(user, '7')

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: '페이지를 찾을 수 없습니다.' },
        FIND_TIMEOUT,
      ),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/task/7')
    expect(queryClient.getQueryData(taskQueries.detail('7').queryKey)).toBeUndefined()
  })

  it('삭제한 항목의 상세 주소로 다시 들어가면 404 화면이 나온다', async () => {
    const user = userEvent.setup()
    const router = renderApp('/task')

    await deleteTask(user, '4')
    await screen.findByRole('heading', { level: 1, name: '할 일' }, FIND_TIMEOUT)

    await router.navigate({ to: '/task/$id', params: { id: '4' } })

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: '페이지를 찾을 수 없습니다.' },
        FIND_TIMEOUT,
      ),
    ).toBeInTheDocument()
  })
})
