import { createFileRoute } from '@tanstack/react-router'
import { UserPage } from '@/pages/user'
import { pageTitle } from '@/shared/config/page-title'

export const Route = createFileRoute('/_app/user')({
  head: () => ({ meta: [{ title: pageTitle('회원정보') }] }),
  component: UserPage,
})
