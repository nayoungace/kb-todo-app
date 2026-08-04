import { TaskCardSkeleton } from '@/entities/task'
import { TASK_CARD_GAP } from '../lib/task-list-layout'

const SKELETON_COUNT = 6

export function TaskListSkeleton() {
  return (
    <div
      className="flex flex-col"
      style={{ gap: TASK_CARD_GAP }}
      role="status"
      aria-busy="true"
      aria-label="할 일 목록을 불러오는 중"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  )
}
