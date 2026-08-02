import { StatCardSkeleton } from '@/shared/ui/stat-card'

export function DashboardSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="집계를 불러오는 중"
    >
      {[0, 1, 2].map((index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  )
}
