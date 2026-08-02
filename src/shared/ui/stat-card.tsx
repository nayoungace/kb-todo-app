import type { ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { Button } from '@/shared/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/shared/shadcn/ui/card'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'

interface StatCardProps {
  label: string
  value: number
  to: LinkProps['to']
}

function StatCardShell({ children }: { children: ReactNode }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-1 flex-col justify-between">{children}</CardContent>
    </Card>
  )
}

export function StatCard({ label, value, to }: StatCardProps) {
  return (
    <StatCardShell>
      <div className="flex flex-col gap-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </div>
      <Button asChild variant="outline" className="mt-3 w-full">
        <Link to={to}>확인하기</Link>
      </Button>
    </StatCardShell>
  )
}

export function StatCardSkeleton() {
  return (
    <StatCardShell>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="mt-3 h-9 w-full" />
    </StatCardShell>
  )
}
