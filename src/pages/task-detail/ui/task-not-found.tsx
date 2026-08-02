import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/shadcn/ui/button'
import { MessagePanel } from '@/shared/ui/message-panel'

export function TaskNotFound() {
  return (
    <MessagePanel
      title="요청하신 할 일을 찾을 수 없습니다."
      description="이미 삭제되었거나 잘못된 주소입니다."
      action={
        <Button asChild>
          <Link to={ROUTES.TASK}>목록으로 돌아가기</Link>
        </Button>
      }
    />
  )
}
