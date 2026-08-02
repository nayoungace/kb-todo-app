import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarClock, List } from 'lucide-react'
import type { TaskDetailResponse } from '@/entities/task'
import { DeleteTaskDialog } from '@/features/task-delete'
import { ROUTES } from '@/shared/config/routes'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/shadcn/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/shadcn/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/shared/shadcn/ui/item'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'

interface TaskDetailCardProps {
  id: string
  task: TaskDetailResponse
}

interface TaskDetailCardShellProps {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}

function TaskDetailCardShell({ header, footer, children }: TaskDetailCardShellProps) {
  return (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
      <CardFooter className="justify-between">{footer}</CardFooter>
    </Card>
  )
}

export function TaskDetailCard({ id, task }: TaskDetailCardProps) {
  return (
    <TaskDetailCardShell
      header={<CardTitle className="text-xl">{task.title}</CardTitle>}
      footer={
        <>
          <Button asChild variant="outline">
            <Link to={ROUTES.TASK}>
              <List />
              목록
            </Link>
          </Button>
          <DeleteTaskDialog id={id} />
        </>
      }
    >
      <p className="leading-relaxed whitespace-pre-wrap">{task.memo}</p>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <CalendarClock />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>등록일자</ItemTitle>
          <ItemDescription>{formatDateTime(task.registerDatetime)}</ItemDescription>
        </ItemContent>
      </Item>
    </TaskDetailCardShell>
  )
}

export function TaskDetailCardSkeleton() {
  return (
    <TaskDetailCardShell
      header={<Skeleton className="h-7 w-48" />}
      footer={
        <>
          <Skeleton className="h-9 w-20 rounded-4xl" />
          <Skeleton className="h-9 w-20 rounded-4xl" />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Skeleton className="size-4" />
        </ItemMedia>
        <ItemContent>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-40" />
        </ItemContent>
      </Item>
    </TaskDetailCardShell>
  )
}
