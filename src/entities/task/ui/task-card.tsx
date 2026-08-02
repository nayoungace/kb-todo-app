import { Badge } from '@/shared/shadcn/ui/badge'
import { Card, CardContent } from '@/shared/shadcn/ui/card'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'
import type { TaskItem, TaskStatus } from '../model/types'

export const TASK_CARD_HEIGHT = 96

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

export function TaskCardSkeleton() {
  return (
    <Card size="sm" className="h-24 justify-center">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  )
}
