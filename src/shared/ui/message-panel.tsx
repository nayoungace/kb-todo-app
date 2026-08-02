import type { ReactNode } from 'react'

interface MessagePanelProps {
  title: string
  description?: string
  action?: ReactNode
}

export function MessagePanel({ title, description, action }: MessagePanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      {action}
    </div>
  )
}
