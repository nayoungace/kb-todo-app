export interface TaskRecord {
  id: number
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

function createSeedTasks(): TaskRecord[] {
  const baseTime = Date.UTC(2026, 0, 1, 9)
  return Array.from({ length: TASK_COUNT }, (_, index) => {
    const id = index + 1
    return {
      id,
      title: `할 일 ${id}`,
      memo: `${id}번째 할 일 메모입니다.`,
      status: id % 3 === 0 ? 'DONE' : 'TODO',
      registerDatetime: new Date(baseTime + index * 3_600_000).toISOString(),
    }
  })
}

let tasks = createSeedTasks()

export const mockDb = {
  getTasks(): TaskRecord[] {
    return tasks
  },
  findTask(id: number): TaskRecord | undefined {
    return tasks.find((task) => task.id === id)
  },
  deleteTask(id: number): boolean {
    const before = tasks.length
    tasks = tasks.filter((task) => task.id !== id)
    return tasks.length < before
  },
}

export function resetMockDb(): void {
  tasks = createSeedTasks()
}
