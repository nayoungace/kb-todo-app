import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'

export function SignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <section className="text-center">
        <h1 className="text-2xl font-bold">로그인</h1>
        <Button variant="link" asChild>
          <Link to={ROUTES.DASHBOARD}>대시보드로 돌아가기</Link>
        </Button>
      </section>
    </main>
  )
}
