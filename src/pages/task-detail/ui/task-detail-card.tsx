import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarClock, List, ListTodo, NotebookPen } from 'lucide-react'
import type { TaskDetailResponse } from '@/entities/task'
import { DeleteTaskDialog } from '@/features/task-delete'
import { ROUTES } from '@/shared/config/routes'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/shadcn/ui/button'
import { Card, CardContent, CardFooter } from '@/shared/shadcn/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/shared/shadcn/ui/item'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'

interface TaskDetailCardProps {
  id: string
  task: TaskDetailResponse
}

interface TaskDetailCardShellProps {
  footer: ReactNode
  children: ReactNode
}

function TaskDetailCardShell({ footer, children }: TaskDetailCardShellProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
      <CardFooter className="justify-between">{footer}</CardFooter>
    </Card>
  )
}

export function TaskDetailCard({ id, task }: TaskDetailCardProps) {
  return (
    <TaskDetailCardShell
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
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ListTodo />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>제목</ItemTitle>
          <ItemDescription>{task.title}</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <NotebookPen />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>메모</ItemTitle>
          <ItemDescription className="line-clamp-none whitespace-pre-wrap">
            {task.memo}
          </ItemDescription>
        </ItemContent>
      </Item>
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
      footer={
        <>
          <Skeleton className="h-9 w-20 rounded-4xl" />
          <Skeleton className="h-9 w-20 rounded-4xl" />
        </>
      }
    >
      {[0, 1, 2].map((index) => (
        <Item key={index} variant="outline">
          <ItemMedia variant="icon">
            <Skeleton className="size-4" />
          </ItemMedia>
          <ItemContent>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-48" />
          </ItemContent>
        </Item>
      ))}
    </TaskDetailCardShell>
  )
}
