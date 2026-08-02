import type { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { authenticateForTest, renderWithProviders } from '@/test/test-utils'
import { DashboardPage } from './dashboard-page'

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('불러오는 동안 스켈레톤을 노출하고 숫자를 먼저 보여주지 않는다', () => {
    renderWithProviders(<DashboardPage />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('220')).not.toBeInTheDocument()
  })

  it('일 · 해야할 일 · 한 일 집계를 표기한다', async () => {
    renderWithProviders(<DashboardPage />)

    // 시드 220건 중 seq % 3 === 0 인 73건이 DONE 이다.
    expect(await screen.findByText('220')).toBeInTheDocument()
    expect(screen.getByText('147')).toBeInTheDocument()
    expect(screen.getByText('73')).toBeInTheDocument()

    expect(screen.getByText('일')).toBeInTheDocument()
    expect(screen.getByText('해야할 일')).toBeInTheDocument()
    expect(screen.getByText('한 일')).toBeInTheDocument()
  })

  it('각 카드의 확인하기 버튼이 할 일 목록으로 이동한다', async () => {
    renderWithProviders(<DashboardPage />)
    await screen.findByText('220')

    const links = screen.getAllByRole('link', { name: '확인하기' })
    expect(links).toHaveLength(3)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/task')
    }
  })

  it('실패하면 다시 시도 버튼만 남는다 — 문구는 전역 모달의 책임이다', async () => {
    server.use(http.get('/api/dashboard', () => new HttpResponse(null, { status: 500 })))

    renderWithProviders(<DashboardPage />)

    expect(await screen.findByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
