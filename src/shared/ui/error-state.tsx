import { Button } from '@/shared/shadcn/ui/button'

interface ErrorStateProps {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex justify-center py-16">
      <Button variant="outline" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  )
}
