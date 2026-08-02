export type TaskStatus = 'TODO' | 'DONE'

export interface TaskItem {
  id: string
  title: string
  memo: string
  status: TaskStatus
}

export interface TaskListParams {
  page: number
}

export interface TaskListResponse {
  data: TaskItem[]
  hasNext: boolean
}

export interface TaskDetailResponse {
  title: string
  memo: string
  registerDatetime: string
}

export interface DeleteTaskResponse {
  success: true
}
