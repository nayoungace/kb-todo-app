import { httpClient } from '@/shared/api'
import type { DashboardResponse } from '../model/types'

export class DashboardRepository {
  public static async getSummary(signal?: AbortSignal): Promise<DashboardResponse> {
    return httpClient.get<DashboardResponse>('/api/dashboard', { signal })
  }
}
