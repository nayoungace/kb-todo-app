import { createFileRoute, redirect } from '@tanstack/react-router'
import { bootstrapSession, getSessionStatus } from '@/entities/session'
import { SignInPage } from '@/pages/sign-in'
import { pageTitle } from '@/shared/config/page-title'
import { ROUTES } from '@/shared/config/routes'

export const Route = createFileRoute('/sign-in')({
  head: () => ({ meta: [{ title: pageTitle('로그인') }] }),
  beforeLoad: async () => {
    await bootstrapSession()
    if (getSessionStatus() === 'authenticated') {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: SignInPage,
})
