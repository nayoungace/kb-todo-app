import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { NotFoundPanel } from '@/shared/ui/not-found-panel'

export function TaskNotFound() {
  return (
    <NotFoundPanel
      description={
        <>
          요청하신 할 일을 찾을 수 없습니다. <br />
          입력하신 주소가 정확한지 다시 한번 확인해 주세요.
        </>
      }
      action={
        <Button asChild variant="outline">
          <Link to={ROUTES.TASK}>목록으로 돌아가기</Link>
        </Button>
      }
    />
  )
}
