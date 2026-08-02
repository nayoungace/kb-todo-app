import { useQuery } from '@tanstack/react-query'
import { taskQueries } from '@/entities/task'
import { HttpError } from '@/shared/api'
import { QueryBoundary } from '@/shared/ui/query-boundary'
import { TaskDetailCard } from './task-detail-card'
import { TaskDetailSkeleton } from './task-detail-skeleton'
import { TaskNotFound } from './task-not-found'

interface TaskDetailPageProps {
  id: string
}

export function TaskDetailPage({ id }: TaskDetailPageProps) {
  const task = useQuery(taskQueries.detail(id))

  if (task.error instanceof HttpError && task.error.status === 404) {
    return <TaskNotFound />
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="mt-2 text-2xl font-bold">할 일 상세</h1>
      </div>

      <QueryBoundary query={task} skeleton={<TaskDetailSkeleton />}>
        {(data) => <TaskDetailCard id={id} task={data} />}
      </QueryBoundary>
    </section>
  )
}
