import type { ReactNode } from 'react'

interface NotFoundPanelProps {
  description: ReactNode
  action: ReactNode
}

export function NotFoundPanel({ description, action }: NotFoundPanelProps) {
  return (
    <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
      <span aria-hidden="true" className="text-[7rem] leading-tight font-bold">
        404
      </span>
      <h1 className="font-medium">페이지를 찾을 수 없습니다.</h1>
      <p className="text-center text-muted-foreground">{description}</p>
      <div className="mt-6 flex gap-4">{action}</div>
    </div>
  )
}
