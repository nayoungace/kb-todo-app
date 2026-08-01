import { httpClient } from '@/shared/api'
import type {
  DeleteTaskResponse,
  TaskDetailResponse,
  TaskListParams,
  TaskListResponse,
} from '../model/types'

export class TaskRepository {
  public static async getList(
    params: TaskListParams,
    signal?: AbortSignal,
  ): Promise<TaskListResponse> {
    return httpClient.get<TaskListResponse>('/api/task', { params: { ...params }, signal })
  }

  public static async getDetail(id: string, signal?: AbortSignal): Promise<TaskDetailResponse> {
    return httpClient.get<TaskDetailResponse>(`/api/task/${encodeURIComponent(id)}`, { signal })
  }

  public static async remove(id: string): Promise<DeleteTaskResponse> {
    return httpClient.delete<DeleteTaskResponse>(`/api/task/${encodeURIComponent(id)}`)
  }
}
