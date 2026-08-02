import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetMockDb } from '@/mocks/data/db'
import { server } from '@/mocks/server'
import { tokenStore } from '@/shared/api'

window.scrollTo = () => {}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetMockDb()
  tokenStore.clear()
})

afterAll(() => server.close())
