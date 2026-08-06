import { useInfiniteQuery } from '@tanstack/react-query'
import { taskQueries } from '@/entities/task'
import { ErrorState } from '@/shared/ui/error-state'
import { MessagePanel } from '@/shared/ui/message-panel'
import { QueryBoundary } from '@/shared/ui/query-boundary'
import { TaskList } from './task-list'
import { TaskListSkeleton } from './task-list-skeleton'

export function TaskListPage() {
  const list = useInfiniteQuery(taskQueries.list())
  const retry = () => void (list.isFetchNextPageError ? list.fetchNextPage() : list.refetch())

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">할 일</h1>
      <QueryBoundary query={list} skeleton={<TaskListSkeleton />}>
        {(data) => {
          const tasks = data.pages.flatMap((page) => page.data)
          if (tasks.length === 0) {
            if (list.isError) return <ErrorState onRetry={retry} />
            return <MessagePanel title="등록된 할 일이 없습니다." />
          }
          return (
            <TaskList
              tasks={tasks}
              hasNextPage={list.hasNextPage}
              isFetching={list.isFetching}
              isFetchingNextPage={list.isFetchingNextPage}
              hasError={list.isError}
              onLoadMore={() => void list.fetchNextPage()}
              onRetry={retry}
            />
          )
        }}
      </QueryBoundary>
    </section>
  )
}
