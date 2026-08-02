import { refreshAccessToken, tokenStore } from '@/shared/api'
import type { AuthTokenResponse, SessionStatus } from './types'

let restored = false
let bootstrapPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export function bootstrapSession(): Promise<void> {
  bootstrapPromise ??= refreshAccessToken()
    .then(() => undefined)
    .finally(() => {
      restored = true
      notify()
    })
  return bootstrapPromise
}

export function establishSession(tokens: AuthTokenResponse): void {
  restored = true
  tokenStore.set(tokens.accessToken)
}

export function getSessionStatus(): SessionStatus {
  if (!restored) return 'restoring'
  return tokenStore.get() !== null ? 'authenticated' : 'unauthenticated'
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  const unsubscribeToken = tokenStore.subscribe(listener)
  return () => {
    listeners.delete(listener)
    unsubscribeToken()
  }
}
