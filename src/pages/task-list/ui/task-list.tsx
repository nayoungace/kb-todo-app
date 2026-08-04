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
      <ul ref={listRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualItems.map((item) => {
          const task = tasks[item.index]
          if (!task) return null
          return (
            <li
              key={task.id}
              ref={virtualizer.measureElement}
              data-index={item.index}
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
            >
              <Link to={ROUTES.TASK_DETAIL} params={{ id: task.id }} className="block">
                <TaskCard task={task} />
              </Link>
            </li>
          )
        })}
      </ul>
      {isFetchingNextPage && (
        <div aria-busy="true">
          <TaskCardSkeleton />
        </div>
      )}
      {hasError && !isFetching && <ErrorState onRetry={onRetry} />}
    </div>
  )
}
