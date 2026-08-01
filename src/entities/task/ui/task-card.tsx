import { Badge } from '@/shared/shadcn/ui/badge'
import { Card, CardContent } from '@/shared/shadcn/ui/card'
import type { TaskItem, TaskStatus } from '../model/types'

/** 가상 스크롤의 estimateSize 가 쓰는 값이므로 아래 h-24 와 함께 바뀌어야 한다. */
export const TASK_CARD_HEIGHT = 96
export const TASK_CARD_GAP = 12

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: '해야할 일',
  DONE: '한 일',
}

interface TaskCardProps {
  task: TaskItem
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card size="sm" className="h-24 justify-center">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-medium">{task.title}</h3>
          <Badge variant={task.status === 'DONE' ? 'default' : 'outline'}>
            {STATUS_LABEL[task.status]}
          </Badge>
        </div>
        <p className="text-muted-foreground line-clamp-2 text-sm">{task.memo}</p>
      </CardContent>
    </Card>
  )
}
