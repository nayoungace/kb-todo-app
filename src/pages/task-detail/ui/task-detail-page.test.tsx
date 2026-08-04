import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { authenticateForTest, renderWithProviders } from '@/test/test-utils'
import { TaskDetailPage } from './task-detail-page'

const navigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => navigate,
}))

async function openDeleteDialog() {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: '삭제' }))
  return user
}

beforeEach(() => {
  authenticateForTest()
  navigate.mockClear()
})

describe('TaskDetailPage', () => {
  it('title · memo · registerDatetime 을 보여준다', async () => {
    renderWithProviders(<TaskDetailPage id="1" />)

    expect(await screen.findByText('할 일 1')).toBeInTheDocument()
    expect(screen.getByText('1번째 할 일 메모입니다.')).toBeInTheDocument()
    // 시드 1번의 registerDatetime 은 2026-01-01T09:00:00Z 다.
    expect(screen.getByText(/2026년 1월 1일/)).toBeInTheDocument()
  })

  it('404 면 목록으로 돌아가는 버튼이 있는 화면을 보여준다 — 재시도 버튼이 아니다', async () => {
    renderWithProviders(<TaskDetailPage id="999" />)

    expect(await screen.findByRole('link', { name: '목록으로 돌아가기' })).toHaveAttribute(
      'href',
      '/task',
    )
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('404 화면의 제목은 상태 코드가 아니라 h1 로 된 설명이다', async () => {
    renderWithProviders(<TaskDetailPage id="999" />)

    await screen.findByRole('link', { name: '목록으로 돌아가기' })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '페이지를 찾을 수 없습니다.',
    )
    expect(screen.queryByRole('heading', { name: '404' })).not.toBeInTheDocument()
  })

  it('로딩 중에는 조작 가능한 컨트롤을 렌더하지 않는다', async () => {
    renderWithProviders(<TaskDetailPage id="1" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '목록' })).not.toBeInTheDocument()

    expect(await screen.findByText('할 일 1')).toBeInTheDocument()
  })

  it('삭제 버튼을 누르면 확인 input 을 가진 모달이 열린다', async () => {
    renderWithProviders(<TaskDetailPage id="1" />)
    await openDeleteDialog()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('할 일 id')).toBeInTheDocument()
  })

  it('입력값이 id 와 같을 때만 제출 버튼이 활성화된다', async () => {
    renderWithProviders(<TaskDetailPage id="2" />)
    const user = await openDeleteDialog()

    const submit = await screen.findByRole('button', { name: '제출' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText('할 일 id'), '1')
    expect(submit).toBeDisabled()

    await user.clear(screen.getByLabelText('할 일 id'))
    await user.type(screen.getByLabelText('할 일 id'), '2')
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it('제출하면 DELETE 를 호출하고 목록으로 이동한다', async () => {
    const deleted: string[] = []
    server.use(
      http.delete<{ id: string }>('/api/task/:id', ({ params }) => {
        deleted.push(params.id)
        return HttpResponse.json({ success: true })
      }),
    )

    renderWithProviders(<TaskDetailPage id="2" />)
    const user = await openDeleteDialog()

    await user.type(await screen.findByLabelText('할 일 id'), '2')
    await user.click(screen.getByRole('button', { name: '제출' }))

    await waitFor(() => expect(deleted).toEqual(['2']))
    expect(navigate).toHaveBeenCalledWith({ to: '/task' })
  })

  it('삭제가 실패하면 확인 모달만 닫히고 상세 화면은 남는다', async () => {
    server.use(
      http.delete('/api/task/:id', () =>
        HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다' }, { status: 404 }),
      ),
    )

    renderWithProviders(<TaskDetailPage id="1" />)
    const user = await openDeleteDialog()

    await user.type(await screen.findByLabelText('할 일 id'), '1')
    await user.click(screen.getByRole('button', { name: '제출' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByText('할 일 1')).toBeInTheDocument()
  })
})
