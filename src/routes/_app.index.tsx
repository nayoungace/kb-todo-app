import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/pages/dashboard'
import { pageTitle } from '@/shared/config/page-title'

export const Route = createFileRoute('/_app/')({
  head: () => ({ meta: [{ title: pageTitle('대시보드') }] }),
  component: DashboardPage,
})
