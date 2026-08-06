import { createFileRoute } from '@tanstack/react-router'
import { NotFoundPage } from '@/pages/not-found'
import { pageTitle } from '@/shared/config/page-title'

export const Route = createFileRoute('/$')({
  head: () => ({ meta: [{ title: pageTitle('페이지를 찾을 수 없습니다.') }] }),
  component: NotFoundPage,
})
