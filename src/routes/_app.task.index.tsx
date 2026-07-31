import { createFileRoute } from '@tanstack/react-router'
import { TaskListPage } from '@/pages/task-list'

export const Route = createFileRoute('/_app/task/')({
  component: TaskListPage,
})
