import { http, HttpResponse } from 'msw'
import { mockDb } from '../data/db'
import { requireAuth, unauthorized } from '../lib/auth-guard'
import { networkDelay } from '../lib/delay'

const PAGE_SIZE = 20

function notFound() {
  return HttpResponse.json({ errorMessage: '할 일을 찾을 수 없습니다' }, { status: 404 })
}

export const taskHandlers = [
  http.get('/api/task', async ({ request }) => {
    await networkDelay()
    if (!requireAuth(request)) return unauthorized()

    const pageParam = new URL(request.url).searchParams.get('page')
    const page = Number(pageParam)
    if (!pageParam || !Number.isInteger(page) || page < 1) {
      return HttpResponse.json({ errorMessage: 'page는 1 이상의 정수여야 합니다' }, { status: 400 })
    }

    const tasks = mockDb.getTasks()
    const start = (page - 1) * PAGE_SIZE
    const data = tasks
      .slice(start, start + PAGE_SIZE)
      .map(({ id, title, memo, status }) => ({ id, title, memo, status }))
    return HttpResponse.json({ data, hasNext: start + PAGE_SIZE < tasks.length })
  }),

  http.get<{ id: string }>('/api/task/:id', async ({ request, params }) => {
    await networkDelay()
    if (!requireAuth(request)) return unauthorized()

    const task = mockDb.findTask(params.id)
    if (!task) return notFound()

    const { title, memo, registerDatetime } = task
    return HttpResponse.json({ title, memo, registerDatetime })
  }),

  http.delete<{ id: string }>('/api/task/:id', async ({ request, params }) => {
    await networkDelay()
    if (!requireAuth(request)) return unauthorized()

    if (!mockDb.deleteTask(params.id)) return notFound()
    return HttpResponse.json({ success: true })
  }),
]
