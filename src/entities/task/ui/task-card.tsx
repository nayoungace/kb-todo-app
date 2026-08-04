import { Check, Clock } from 'lucide-react'
import { Badge } from '@/shared/shadcn/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/shared/shadcn/ui/item'
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
  const isDone = task.status === 'DONE'

  return (
    <Item variant="outline" className="h-24 bg-card hover:bg-muted">
      <ItemContent>
        <ItemTitle>
          <h3>{task.title}</h3>
        </ItemTitle>
        <ItemDescription>{task.memo}</ItemDescription>
      </ItemContent>
      <ItemActions className="translate-y-0.5 self-start">
        <Badge variant={isDone ? 'default' : 'outline'}>
          {isDone ? <Check data-icon="inline-start" /> : <Clock data-icon="inline-start" />}
          {STATUS_LABEL[task.status]}
        </Badge>
      </ItemActions>
    </Item>
  )
}

export function TaskCardSkeleton() {
  return (
    <Item variant="outline" className="h-24 bg-card">
      <ItemContent>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-3/4" />
      </ItemContent>
      <ItemActions className="translate-y-0.5 self-start">
        <Skeleton className="h-5 w-20 rounded-3xl" />
      </ItemActions>
    </Item>
  )
}
