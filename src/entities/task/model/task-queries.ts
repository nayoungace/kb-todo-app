import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { TaskRepository } from '../api/task-repository'

const taskKey = ['task'] as const

export const taskQueries = {
  list: () =>
    infiniteQueryOptions({
      queryKey: [...taskKey, 'list'] as const,
      queryFn: ({ pageParam, signal }) => TaskRepository.getList({ page: pageParam }, signal),
      initialPageParam: 1,
      getNextPageParam: (lastPage, _allPages, lastPageParam) =>
        lastPage.hasNext ? lastPageParam + 1 : undefined,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: [...taskKey, 'detail', id] as const,
      queryFn: ({ signal }) => TaskRepository.getDetail(id, signal),
    }),
}
