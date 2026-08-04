import { createFileRoute } from '@tanstack/react-router'
import { TaskDetailPage } from '@/pages/task-detail'
import { pageTitle } from '@/shared/config/page-title'

export const Route = createFileRoute('/_app/task/$id')({
  head: () => ({ meta: [{ title: pageTitle('할 일 상세') }] }),
  component: TaskDetailRoute,
})

function TaskDetailRoute() {
  const { id } = Route.useParams()
  return <TaskDetailPage id={id} />
}
