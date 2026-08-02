import { beforeEach, describe, expect, it } from 'vitest'
import { useInfiniteQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { authenticateForTest, createQueryWrapper } from '@/test/test-utils'
import { taskQueries } from './task-queries'
import type { TaskListResponse } from './types'

function pageOf(hasNext: boolean): TaskListResponse {
  return { data: [], hasNext }
}

describe('taskQueries.list', () => {
  it('hasNext가 true면 직전 페이지 번호 다음을 반환한다', () => {
    const { getNextPageParam } = taskQueries.list()

    expect(getNextPageParam(pageOf(true), [pageOf(true)], 1, [1])).toBe(2)
    expect(getNextPageParam(pageOf(true), [], 10, [10])).toBe(11)
  })

  it('hasNext가 false면 undefined를 반환해 무한 스크롤을 멈춘다', () => {
    const { getNextPageParam } = taskQueries.list()

    expect(getNextPageParam(pageOf(false), [pageOf(false)], 11, [11])).toBeUndefined()
  })

  it('목록 화면이 자체 재시도 UI를 가지므로 meta로 모달 대상에서 빠진다', () => {
    expect(taskQueries.list().meta).toEqual({ hasInlineErrorUi: true })
  })
})

describe('taskQueries.list 통합', () => {
  beforeEach(() => {
    authenticateForTest()
  })

  it('fetchNextPage로 다음 페이지가 이어붙는다', async () => {
    const { result } = renderHook(() => useInfiniteQuery(taskQueries.list()), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.hasNextPage).toBe(true)

    await act(async () => {
      await result.current.fetchNextPage()
    })

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))
    expect(result.current.data?.pages.flatMap((page) => page.data)).toHaveLength(40)
  })
})
