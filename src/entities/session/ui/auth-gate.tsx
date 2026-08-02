import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'
import { MessagePanel } from '@/shared/ui/message-panel'
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
      <MessagePanel
        title="이 화면은 로그인 후 볼 수 있는 화면입니다."
        description="로그인 해주세요."
        action={
          <Button asChild>
            <Link to={ROUTES.SIGN_IN}>로그인 하러 가기</Link>
          </Button>
        }
      />
    )
  }

  return children
}
