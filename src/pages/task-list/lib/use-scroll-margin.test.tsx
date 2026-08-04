import { useRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useScrollMargin } from './use-scroll-margin'

let listTop = 0

function stubBoundingRect() {
  return vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(() => ({ top: listTop, height: 0 }) as DOMRect)
}

function Harness() {
  const ref = useRef<HTMLUListElement>(null)
  const scrollMargin = useScrollMargin(ref)
  return <ul ref={ref} data-testid="margin">{`${scrollMargin}`}</ul>
}

afterEach(() => {
  vi.restoreAllMocks()
  listTop = 0
})

describe('useScrollMargin', () => {
  it('마운트 시 문서 기준 오프셋을 잰다', () => {
    listTop = 100
    stubBoundingRect()

    render(<Harness />)

    expect(screen.getByTestId('margin')).toHaveTextContent('100')
  })

  it('스크롤된 상태에서는 window.scrollY 를 더한다', () => {
    listTop = 100
    stubBoundingRect()
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(400)

    render(<Harness />)

    expect(screen.getByTestId('margin')).toHaveTextContent('500')
  })

  it('리사이즈로 상단 레이아웃이 바뀌면 다시 잰다', () => {
    listTop = 100
    stubBoundingRect()

    render(<Harness />)
    expect(screen.getByTestId('margin')).toHaveTextContent('100')

    listTop = 40
    fireEvent(window, new Event('resize'))

    expect(screen.getByTestId('margin')).toHaveTextContent('40')
  })
})
