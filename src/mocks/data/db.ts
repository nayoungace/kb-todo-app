export interface TaskRecord {
  id: string
  title: string
  memo: string
  status: 'TODO' | 'DONE'
  registerDatetime: string
}

export const SEED_ACCOUNT = {
  id: 1,
  email: 'test@kb.co.kr',
  password: 'password123',
  name: '홍길동',
  memo: 'KB TODO 과제용 계정입니다.',
}

const TASK_COUNT = 220
const STORAGE_KEY = 'kb-todo-app:mock-tasks:v1'
const isPersistent = !import.meta.env.TEST && typeof sessionStorage !== 'undefined'

function createSeedTasks(): TaskRecord[] {
  const baseTime = Date.UTC(2026, 0, 1, 9)
  return Array.from({ length: TASK_COUNT }, (_, index) => {
    const seq = index + 1
    return {
      id: String(seq),
      title: `할 일 ${seq}`,
      memo: `${seq}번째 할 일 메모입니다.`,
      status: seq % 3 === 0 ? 'DONE' : 'TODO',
      registerDatetime: new Date(baseTime + index * 3_600_000).toISOString(),
    }
  })
}

function readStoredTasks(): TaskRecord[] | undefined {
  if (!isPersistent) return undefined
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : undefined
  } catch {
    return undefined
  }
}

function writeStoredTasks(next: TaskRecord[]): void {
  if (!isPersistent) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    return
  }
}

function clearStoredTasks(): void {
  if (!isPersistent) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

let tasks = readStoredTasks() ?? createSeedTasks()

export const mockDb = {
  getTasks(): TaskRecord[] {
    return tasks
  },
  findTask(id: string): TaskRecord | undefined {
    return tasks.find((task) => task.id === id)
  },
  deleteTask(id: string): boolean {
    const before = tasks.length
    tasks = tasks.filter((task) => task.id !== id)
    if (tasks.length === before) return false
    writeStoredTasks(tasks)
    return true
  },
}

export function resetMockDb(): void {
  tasks = createSeedTasks()
  clearStoredTasks()
}
