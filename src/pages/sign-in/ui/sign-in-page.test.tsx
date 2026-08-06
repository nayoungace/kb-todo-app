import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, TEST_ACCOUNT } from '@/test/test-utils'
import { SignInPage } from './sign-in-page'

const INVALID_EMAIL_MESSAGE = 'email 형식이 올바르지 않습니다'

describe('SignInPage 유효성 표시', () => {
  it('입력 중에는 오류를 띄우지 않고 blur 이후에만 띄운다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInPage />)

    await user.type(screen.getByLabelText('이메일'), 'not-an-email')

    expect(screen.queryByText(INVALID_EMAIL_MESSAGE)).not.toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).not.toHaveAttribute('aria-invalid', 'true')

    await user.tab()

    expect(await screen.findByText(INVALID_EMAIL_MESSAGE)).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'true')
  })

  it('제출 버튼은 blur 여부와 무관하게 값이 유효해지는 즉시 활성화된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInPage />)

    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()

    await user.type(screen.getByLabelText('이메일'), TEST_ACCOUNT.email)
    await user.type(screen.getByLabelText('비밀번호'), TEST_ACCOUNT.password)

    await waitFor(() => expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled())
    expect(screen.queryByText(INVALID_EMAIL_MESSAGE)).not.toBeInTheDocument()
  })

  it('오류 문구는 입력의 설명으로 연결된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInPage />)

    expect(screen.getByLabelText('이메일')).not.toHaveAccessibleDescription()

    await user.type(screen.getByLabelText('이메일'), 'not-an-email')
    await user.tab()

    await waitFor(() =>
      expect(screen.getByLabelText('이메일')).toHaveAccessibleDescription(INVALID_EMAIL_MESSAGE),
    )
  })
})
