import { refreshAccessToken, tokenStore } from '@/shared/api'
import type { AuthTokenResponse, SessionStatus } from './types'

const REFRESH_COOKIE_NAME = 'token'

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

// 자의적 결정: 응답 본문의 refreshToken 은 저장하지 않는다. JS 로 영속화하면 XSS 노출면이
// 넓어지므로, 서버가 Set-Cookie 로 심는 것을 전제한다 — 명세의 sign-in 응답에는 이 규정이
// 없어 백엔드 계약 협의가 필요한 가정이다.
export function establishSession(tokens: AuthTokenResponse): void {
  restored = true
  tokenStore.set(tokens.accessToken)
}

export function clearSession(): void {
  restored = true
  tokenStore.clear()
  document.cookie = `${REFRESH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Strict`
  notify()
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
