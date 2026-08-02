import { TaskDetailCardSkeleton } from './task-detail-card'

export function TaskDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="할 일을 불러오는 중">
      <TaskDetailCardSkeleton />
    </div>
  )
}
