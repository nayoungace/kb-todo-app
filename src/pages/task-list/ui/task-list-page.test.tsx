import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { authenticateForTest, renderWithProviders } from '@/test/test-utils'
import { TaskListPage } from './task-list-page'

interface MockLinkProps {
  to: string
  params?: Record<string, string>
  className?: string
  children: ReactNode
}

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, params, className, children }: MockLinkProps) => (
    <a
      href={Object.entries(params ?? {}).reduce(
        (path, [key, value]) => path.replace(`$${key}`, value),
        to,
      )}
      className={className}
    >
      {children}
    </a>
  ),
}))

const PAGE_SIZE = 20

beforeEach(() => {
  authenticateForTest()
})

describe('TaskListPage', () => {
  it('로딩 중에는 스켈레톤을 노출한다', () => {
    const { container } = renderWithProviders(<TaskListPage />)

    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('카드에 title과 memo와 status 배지를 보여준다', async () => {
    renderWithProviders(<TaskListPage />)

    expect(await screen.findByRole('heading', { name: '할 일 1' })).toBeInTheDocument()
    expect(screen.getByText('1번째 할 일 메모입니다.')).toBeInTheDocument()
    expect(screen.getAllByText('해야할 일').length).toBeGreaterThan(0)
  })

  it('화면에 보이는 요소만 렌더한다', async () => {
    renderWithProviders(<TaskListPage />)
    await screen.findByRole('heading', { name: '할 일 1' })

    expect(screen.getAllByRole('link').length).toBeLessThan(PAGE_SIZE)
  })

  it('가상 목록도 목록 시맨틱과 전체 위치를 알린다 — 다음 페이지가 남으면 전체 수는 미확정이다', async () => {
    renderWithProviders(<TaskListPage />)
    await screen.findByRole('heading', { name: '할 일 1' })

    expect(screen.getByRole('list')).toBeInTheDocument()
    const [first] = screen.getAllByRole('listitem')
    expect(first).toHaveAttribute('aria-posinset', '1')
    expect(first).toHaveAttribute('aria-setsize', '-1')
  })

  it('마지막 페이지까지 받으면 전체 수를 확정해서 알린다', async () => {
    server.use(
      http.get('/api/task', () =>
        HttpResponse.json({
          data: [{ id: '1', title: '할 일 1', memo: '1번째 할 일 메모입니다.', status: 'TODO' }],
          hasNext: false,
        }),
      ),
    )
    renderWithProviders(<TaskListPage />)
    await screen.findByRole('heading', { name: '할 일 1' })

    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('aria-setsize', '1')
  })

  it('다음 페이지 실패는 문구 없이도 보조기술에 전달된다', async () => {
    let calls = 0
    server.use(
      http.get('/api/task', () => {
        calls += 1
        if (calls === 1) {
          return HttpResponse.json({
            data: [{ id: '1', title: '할 일 1', memo: '1번째 할 일 메모입니다.', status: 'TODO' }],
            hasNext: true,
          })
        }
        return HttpResponse.json({ errorMessage: '목록을 불러오지 못했습니다' }, { status: 500 })
      }),
    )
    renderWithProviders(<TaskListPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent('할 일을 더 불러오지 못했습니다.')
  })

  it('카드가 상세 경로로 이동하는 링크다', async () => {
    renderWithProviders(<TaskListPage />)
    await screen.findByRole('heading', { name: '할 일 1' })

    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/task/1')
  })

  it('데이터가 0건이면 빈 상태 문구를 노출한다', async () => {
    server.use(http.get('/api/task', () => HttpResponse.json({ data: [], hasNext: false })))
    renderWithProviders(<TaskListPage />)

    expect(await screen.findByText('등록된 할 일이 없습니다.')).toBeInTheDocument()
  })

  it('첫 페이지부터 실패하면 다시 시도 버튼을 노출한다', async () => {
    server.use(
      http.get('/api/task', () =>
        HttpResponse.json({ errorMessage: '목록을 불러오지 못했습니다' }, { status: 500 }),
      ),
    )
    renderWithProviders(<TaskListPage />)

    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('다음 페이지를 받다 실패해도 이미 불러온 목록은 남는다', async () => {
    let calls = 0
    server.use(
      http.get('/api/task', () => {
        calls += 1
        if (calls === 1) {
          return HttpResponse.json({
            data: [{ id: '1', title: '할 일 1', memo: '1번째 할 일 메모입니다.', status: 'TODO' }],
            hasNext: true,
          })
        }
        return HttpResponse.json({ errorMessage: '목록을 불러오지 못했습니다' }, { status: 500 })
      }),
    )
    renderWithProviders(<TaskListPage />)

    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '할 일 1' })).toBeInTheDocument()
    expect(calls).toBe(2)
  })

  it('리페치가 실패하면 다시 시도가 다음 페이지가 아니라 첫 페이지부터 다시 받는다', async () => {
    const requestedPages: string[] = []
    let failing = false
    server.use(
      http.get('/api/task', ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? ''
        requestedPages.push(page)
        if (failing) {
          return HttpResponse.json({ errorMessage: '목록을 불러오지 못했습니다' }, { status: 500 })
        }
        return HttpResponse.json({
          data: [
            {
              id: page,
              title: `할 일 ${page}`,
              memo: `${page}번째 할 일 메모입니다.`,
              status: 'TODO',
            },
          ],
          hasNext: page === '1',
        })
      }),
    )

    const { queryClient, unmount } = renderWithProviders(<TaskListPage />)
    await screen.findByRole('heading', { name: '할 일 2' })

    failing = true
    unmount()
    renderWithProviders(<TaskListPage />, queryClient)
    const retry = await screen.findByRole('button', { name: '다시 시도' })

    failing = false
    requestedPages.length = 0
    await userEvent.click(retry)

    await waitFor(() => expect(requestedPages).toEqual(['1', '2']))
  })
})
