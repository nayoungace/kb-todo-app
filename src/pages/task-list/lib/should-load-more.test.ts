import { describe, expect, it } from 'vitest'
import { PREFETCH_ITEM_COUNT, shouldLoadMore } from './should-load-more'

const base = {
  lastRenderedIndex: 19,
  total: 20,
  hasNextPage: true,
  isFetchingNextPage: false,
  hasError: false,
}

const firstTriggeringIndex = base.total - 1 - PREFETCH_ITEM_COUNT

describe('shouldLoadMore', () => {
  it('마지막 요소가 렌더되면 다음 페이지를 요청한다', () => {
    expect(shouldLoadMore(base)).toBe(true)
  })

  it('끝에서 PREFETCH_ITEM_COUNT 만큼 남으면 미리 요청한다', () => {
    expect(shouldLoadMore({ ...base, lastRenderedIndex: firstTriggeringIndex })).toBe(true)
  })

  it('아직 프리페치 경계에 닿지 않으면 요청하지 않는다', () => {
    expect(shouldLoadMore({ ...base, lastRenderedIndex: firstTriggeringIndex - 1 })).toBe(false)
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

  it('누적 개수가 프리페치 폭보다 작아도 첫 렌더에서 요청한다', () => {
    expect(shouldLoadMore({ ...base, lastRenderedIndex: 0, total: 1 })).toBe(true)
  })
})
