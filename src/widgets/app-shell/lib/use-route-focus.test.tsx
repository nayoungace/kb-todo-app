import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouteFocus } from './use-route-focus'

const pathname = vi.hoisted(() => ({ current: '/' }))

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: pathname.current } }),
}))

function Content() {
  const ref = useRouteFocus<HTMLDivElement>()

  return (
    <>
      <button type="button">바깥 버튼</button>
      <div ref={ref} tabIndex={-1} data-testid="content">
        <h1>{pathname.current}</h1>
      </div>
    </>
  )
}

beforeEach(() => {
  pathname.current = '/'
})

describe('useRouteFocus', () => {
  it('첫 렌더에는 포커스를 옮기지 않는다', () => {
    render(<Content />)

    expect(screen.getByTestId('content')).not.toHaveFocus()
    expect(document.body).toHaveFocus()
  })

  it('pathname 이 바뀌면 콘텐츠 영역으로 포커스를 옮긴다', () => {
    const { rerender } = render(<Content />)
    screen.getByRole('button', { name: '바깥 버튼' }).focus()

    pathname.current = '/task'
    rerender(<Content />)

    expect(screen.getByTestId('content')).toHaveFocus()
  })

  it('같은 pathname 으로 다시 렌더되면 포커스를 빼앗지 않는다', () => {
    const { rerender } = render(<Content />)

    pathname.current = '/task'
    rerender(<Content />)

    const outside = screen.getByRole('button', { name: '바깥 버튼' })
    outside.focus()
    rerender(<Content />)

    expect(outside).toHaveFocus()
  })
})
