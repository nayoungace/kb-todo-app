import { useQuery } from '@tanstack/react-query'
import { dashboardQueries } from '@/entities/dashboard'
import { ROUTES } from '@/shared/config/routes'
import { QueryBoundary } from '@/shared/ui/query-boundary'
import { StatCard } from '@/shared/ui/stat-card'
import { DashboardSkeleton } from './dashboard-skeleton'

export function DashboardPage() {
  const summary = useQuery(dashboardQueries.summary())

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <QueryBoundary query={summary} skeleton={<DashboardSkeleton />}>
        {(data) => (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="일" value={data.numOfTask} to={ROUTES.TASK} />
            <StatCard label="해야할 일" value={data.numOfRestTask} to={ROUTES.TASK} />
            <StatCard label="한 일" value={data.numOfDoneTask} to={ROUTES.TASK} />
          </div>
        )}
      </QueryBoundary>
    </section>
  )
}
