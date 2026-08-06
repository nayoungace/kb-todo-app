import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QueryBoundary } from './query-boundary'

function createQuery(overrides: Partial<Parameters<typeof QueryBoundary<string>>[0]['query']>) {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('QueryBoundary', () => {
  it('로딩 중에는 스켈레톤을 렌더한다', () => {
    render(
      <QueryBoundary
        query={createQuery({ isPending: true })}
        skeleton={<div data-testid="skeleton" />}
      >
        {(data) => <p>{data}</p>}
      </QueryBoundary>,
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('실패 시 다시 시도 버튼을 렌더하고 클릭하면 refetch 한다', async () => {
    const refetch = vi.fn()
    render(
      <QueryBoundary query={createQuery({ isError: true, refetch })} skeleton={<div />}>
        {(data) => <p>{data}</p>}
      </QueryBoundary>,
    )

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('성공 시 데이터를 children 에 넘긴다', () => {
    render(
      <QueryBoundary query={createQuery({ data: '할 일 목록' })} skeleton={<div />}>
        {(data) => <p>{data}</p>}
      </QueryBoundary>,
    )

    expect(screen.getByText('할 일 목록')).toBeInTheDocument()
  })

  it('이미 받은 데이터가 있는 실패에는 직전 내용을 지우지 않는다', () => {
    render(
      <QueryBoundary query={createQuery({ isError: true, data: '할 일 목록' })} skeleton={<div />}>
        {(data) => <p>{data}</p>}
      </QueryBoundary>,
    )

    expect(screen.getByText('할 일 목록')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
  })

  it('실패 사유는 보이는 문구가 아니라 스크린리더 전용 안내로만 낸다', () => {
    render(
      <QueryBoundary query={createQuery({ isError: true })} skeleton={<div />}>
        {(data) => <p>{data}</p>}
      </QueryBoundary>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('요청을 처리하지 못했습니다.')
    expect(screen.getByText('요청을 처리하지 못했습니다.')).toHaveClass('sr-only')
  })
})
