import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'
import { useSession } from '../model/use-session'

export function AuthGate({ children }: { children: ReactNode }): ReactNode {
  const { status } = useSession()

  if (status === 'restoring') {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">이 화면은 로그인 후 볼 수 있는 화면입니다.</p>
        <p className="text-muted-foreground text-sm">로그인 해주세요.</p>
        <Button asChild>
          <Link to={ROUTES.SIGN_IN}>로그인 하러 가기</Link>
        </Button>
      </div>
    )
  }

  return children
}
