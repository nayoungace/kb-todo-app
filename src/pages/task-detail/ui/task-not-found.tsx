import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'

export function TaskNotFound() {
  return (
    <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
      <span aria-hidden="true" className="text-[7rem] leading-tight font-bold">
        404
      </span>
      <h1 className="font-medium">페이지를 찾을 수 없습니다.</h1>
      <p className="text-center text-muted-foreground">
        요청하신 페이지를 찾을 수 없습니다. <br />
        입력하신 주소가 정확한지 다시 한번 확인해 주세요.
      </p>
      <div className="mt-6 flex gap-4">
        <Button asChild variant="outline">
          <Link to={ROUTES.TASK}>목록으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
}
