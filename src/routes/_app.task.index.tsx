import { createFileRoute } from '@tanstack/react-router'
import { TaskListPage } from '@/pages/task-list'
import { pageTitle } from '@/shared/config/page-title'

export const Route = createFileRoute('/_app/task/')({
  head: () => ({ meta: [{ title: pageTitle('할 일') }] }),
  component: TaskListPage,
})
