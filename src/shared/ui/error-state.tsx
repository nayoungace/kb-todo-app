import { Button } from '@/shared/shadcn/ui/button'

const DEFAULT_MESSAGE = '요청을 처리하지 못했습니다.'

interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export function ErrorState({ message = DEFAULT_MESSAGE, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex justify-center py-16">
      <span className="sr-only">{message}</span>
      <Button variant="outline" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}
