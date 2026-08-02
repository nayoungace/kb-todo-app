import { describe, expect, it } from 'vitest'
import { shouldLoadMore } from './should-load-more'

const base = {
  lastRenderedIndex: 19,
  total: 20,
  hasNextPage: true,
  isFetchingNextPage: false,
  hasError: false,
}

describe('shouldLoadMore', () => {
  it('마지막 요소가 렌더되면 다음 페이지를 요청한다', () => {
    expect(shouldLoadMore(base)).toBe(true)
  })

  it('아직 마지막에 닿지 않으면 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, lastRenderedIndex: 18 })).toBe(false)
  })

  it('이미 받아오는 중이면 중복 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, isFetchingNextPage: true })).toBe(false)
  })

  it('다음 페이지가 없으면 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, hasNextPage: false })).toBe(false)
  })

  it('직전 요청이 실패했으면 자동으로 다시 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, hasError: true })).toBe(false)
  })

  it('렌더된 요소가 없으면 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, lastRenderedIndex: undefined, total: 0 })).toBe(false)
  })
})
