import { http, HttpResponse } from 'msw'
import { SEED_ACCOUNT } from '../data/db'
import { requireAuth, unauthorized } from '../lib/auth-guard'
import { networkDelay } from '../lib/delay'

export const userHandlers = [
  http.get('/api/user', async ({ request }) => {
    await networkDelay()
    if (!requireAuth(request)) return unauthorized()

    return HttpResponse.json({ name: SEED_ACCOUNT.name, memo: SEED_ACCOUNT.memo })
  }),
]
