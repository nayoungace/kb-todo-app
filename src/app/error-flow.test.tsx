import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { SignInPage } from '@/pages/sign-in'
import { TaskDetailPage } from '@/pages/task-detail'
import { errorModalStore } from '@/shared/lib/error-modal-store'
import { ErrorModal } from '@/shared/ui/error-modal'
import { authenticateForTest, renderWithProviders, TEST_ACCOUNT } from '@/test/test-utils'
import { queryClient } from './query-client'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}))

afterEach(() => {
  errorModalStore.close()
  queryClient.clear()
})

function renderSignIn() {
  return renderWithProviders(
    <>
      <SignInPage />
      <ErrorModal />
    </>,
    queryClient,
  )
}

async function submit(password: string) {
  await userEvent.type(screen.getByLabelText('이메일'), TEST_ACCOUNT.email)
  await userEvent.type(screen.getByLabelText('비밀번호'), password)
  await userEvent.click(screen.getByRole('button', { name: '로그인' }))
}

describe('로그인 실패 표시', () => {
  it('서버가 준 errorMessage 를 그대로 모달에 노출한다', async () => {
    renderSignIn()

    await submit('wrongpassword1')

    expect(await screen.findByRole('dialog')).toHaveTextContent(
      '이메일 또는 비밀번호가 올바르지 않습니다',
    )
  })

  it('모달의 제목은 오류이고 서버 문구는 설명에 온다', async () => {
    renderSignIn()

    await submit('wrongpassword1')

    const dialog = await screen.findByRole('dialog', { name: '오류' })
    expect(dialog).toHaveAccessibleDescription('이메일 또는 비밀번호가 올바르지 않습니다')
  })

  it('API 에러를 인라인으로 중복 표시하지 않는다', async () => {
    renderSignIn()

    await submit('wrongpassword1')
    await screen.findByRole('dialog')

    const inline = screen
      .queryAllByRole('alert')
      .filter((el) => el.textContent?.includes('이메일 또는 비밀번호가 올바르지 않습니다'))
    expect(inline).toHaveLength(0)
  })

  it('로그인이 401 을 받아도 모달을 띄운다 — AuthGate 가 없는 화면이다', async () => {
    server.use(
      http.post('/api/sign-in', () =>
        HttpResponse.json({ errorMessage: '세션이 만료되었습니다' }, { status: 401 }),
      ),
    )
    renderSignIn()

    await submit('wrongpassword1')

    expect(await screen.findByRole('dialog')).toHaveTextContent('세션이 만료되었습니다')
  })

  it('폼 검증 에러는 모달이 아니라 인라인으로 남는다', async () => {
    renderSignIn()

    await userEvent.type(screen.getByLabelText('이메일'), '이메일아님')
    await userEvent.tab()

    expect(await screen.findByText('email 형식이 올바르지 않습니다')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('삭제 실패 표시', () => {
  it('뮤테이션 404 는 서버 문구를 모달로 띄우고 상세 화면을 유지한다', async () => {
    authenticateForTest()
    server.use(
      http.delete('/api/task/:id', () =>
        HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다' }, { status: 404 }),
      ),
    )

    renderWithProviders(
      <>
        <TaskDetailPage id="1" />
        <ErrorModal />
      </>,
      queryClient,
    )

    await userEvent.click(await screen.findByRole('button', { name: '삭제' }))
    await userEvent.type(await screen.findByLabelText('할 일 id'), '1')
    await userEvent.click(screen.getByRole('button', { name: '제출' }))

    expect(await screen.findByRole('dialog')).toHaveTextContent('할 일을 찾을 수 없습니다')
    expect(screen.getByText('할 일 1')).toBeInTheDocument()
  })
})
