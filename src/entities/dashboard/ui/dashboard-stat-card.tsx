import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/shadcn/ui/card'

interface DashboardStatCardProps {
  label: string
  count: number
  icon: LucideIcon
}

export function DashboardStatCard({ label, count, icon: Icon }: DashboardStatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4" aria-hidden />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{count}</p>
      </CardContent>
    </Card>
  )
}
