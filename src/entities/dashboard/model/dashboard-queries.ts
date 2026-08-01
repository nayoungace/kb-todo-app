import { queryOptions } from '@tanstack/react-query'
import { DashboardRepository } from '../api/dashboard-repository'

const dashboardKey = ['dashboard'] as const

export const dashboardQueries = {
  summary: () =>
    queryOptions({
      queryKey: [...dashboardKey, 'summary'] as const,
      queryFn: ({ signal }) => DashboardRepository.getSummary(signal),
    }),
}
