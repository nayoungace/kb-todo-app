import { createFileRoute, redirect } from '@tanstack/react-router'
import { bootstrapSession, getSessionStatus } from '@/entities/session'
import { SignInPage } from '@/pages/sign-in'
import { ROUTES } from '@/shared/config/routes'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async () => {
    await bootstrapSession()
    if (getSessionStatus() === 'authenticated') {
      throw redirect({ to: ROUTES.DASHBOARD })
    }
  },
  component: SignInPage,
})
