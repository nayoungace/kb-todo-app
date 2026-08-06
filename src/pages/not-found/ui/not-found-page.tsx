import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { NotFoundPanel } from '@/shared/ui/not-found-panel'

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col p-6">
      <NotFoundPanel
        description={
          <>
            요청하신 페이지를 찾을 수 없습니다. <br />
            입력하신 주소가 정확한지 다시 한번 확인해 주세요.
          </>
        }
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.DASHBOARD}>대시보드로 돌아가기</Link>
          </Button>
        }
      />
    </main>
  )
}
