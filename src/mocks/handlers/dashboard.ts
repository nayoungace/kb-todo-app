import { http, HttpResponse } from 'msw'
import { mockDb } from '../data/db'
import { requireAuth, unauthorized } from '../lib/auth-guard'
import { networkDelay } from '../lib/delay'

export const dashboardHandlers = [
  http.get('/api/dashboard', async ({ request }) => {
    await networkDelay()
    if (!requireAuth(request)) return unauthorized()

    const tasks = mockDb.getTasks()
    const numOfDoneTask = tasks.filter((task) => task.status === 'DONE').length
    return HttpResponse.json({
      numOfTask: tasks.length,
      numOfRestTask: tasks.length - numOfDoneTask,
      numOfDoneTask,
    })
  }),
]
