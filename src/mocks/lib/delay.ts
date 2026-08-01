import { delay } from 'msw'

export function networkDelay(): Promise<void> {
  if (import.meta.env.TEST) return Promise.resolve()
  return delay()
}
