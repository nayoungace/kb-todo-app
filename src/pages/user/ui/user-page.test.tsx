import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { authenticateForTest, renderWithProviders, TEST_ACCOUNT } from '@/test/test-utils'
import { UserPage } from './user-page'

describe('UserPage', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('불러오는 동안 스켈레톤을 노출하고 회원정보를 먼저 보여주지 않는다', () => {
    renderWithProviders(<UserPage />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText(TEST_ACCOUNT.name)).not.toBeInTheDocument()
  })

  it('name 과 memo 를 라벨과 함께 보여준다', async () => {
    renderWithProviders(<UserPage />)

    expect(await screen.findByText(TEST_ACCOUNT.name)).toBeInTheDocument()
    expect(screen.getByText(TEST_ACCOUNT.memo)).toBeInTheDocument()

    expect(screen.getByText('이름')).toBeInTheDocument()
    expect(screen.getByText('메모')).toBeInTheDocument()
  })

  it('실패하면 다시 시도 버튼만 남는다 — 문구는 전역 모달의 책임이다', async () => {
    server.use(http.get('/api/user', () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<UserPage />)

    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
