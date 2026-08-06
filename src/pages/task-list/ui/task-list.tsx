import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { TaskItem } from '@/entities/task'
import { TASK_CARD_HEIGHT, TaskCard, TaskCardSkeleton } from '@/entities/task'
import { ROUTES } from '@/shared/config/routes'
import { ErrorState } from '@/shared/ui/error-state'
import { shouldLoadMore } from '../lib/should-load-more'
import { TASK_CARD_GAP } from '../lib/task-list-layout'
import { useScrollMargin } from '../lib/use-scroll-margin'

interface TaskListProps {
  tasks: TaskItem[]
  hasNextPage: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  hasError: boolean
  onLoadMore: () => void
  onRetry: () => void
}

export function TaskList({
  tasks,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  hasError,
  onLoadMore,
  onRetry,
}: TaskListProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const scrollMargin = useScrollMargin(listRef)

  const virtualizer = useWindowVirtualizer<HTMLLIElement>({
    count: tasks.length,
    estimateSize: () => TASK_CARD_HEIGHT,
    measureElement: (element) => element.getBoundingClientRect().height || TASK_CARD_HEIGHT,
    gap: TASK_CARD_GAP,
    overscan: 5,
    scrollMargin,
  })
  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    if (
      shouldLoadMore({
        lastRenderedIndex: virtualItems.at(-1)?.index,
        total: tasks.length,
        hasNextPage,
        isFetchingNextPage,
        hasError,
      })
    ) {
      onLoadMore()
    }
  }, [virtualItems, tasks.length, hasNextPage, isFetchingNextPage, hasError, onLoadMore])

  return (
    <div className="flex flex-col" style={{ gap: TASK_CARD_GAP }}>
      <ul
        ref={listRef}
        role="list"
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((item) => {
          const task = tasks[item.index]
          if (!task) return null
          return (
            <li
              key={task.id}
              ref={virtualizer.measureElement}
              data-index={item.index}
              aria-posinset={item.index + 1}
              aria-setsize={hasNextPage ? -1 : tasks.length}
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
            >
              <Link
                to={ROUTES.TASK_DETAIL}
                params={{ id: task.id }}
                className="block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <TaskCard task={task} />
              </Link>
            </li>
          )
        })}
      </ul>
      {isFetchingNextPage && (
        <div role="status" aria-busy="true" aria-label="다음 할 일을 불러오는 중">
          <TaskCardSkeleton />
        </div>
      )}
      {hasError && !isFetching && (
        <ErrorState message="할 일을 더 불러오지 못했습니다." onRetry={onRetry} />
      )}
    </div>
  )
}
