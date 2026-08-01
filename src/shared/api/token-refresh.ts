import { tokenStore } from './token-store'

let refreshPromise: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  try {
    const response = await fetch(new URL('/api/refresh', window.location.origin), {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      tokenStore.clear()
      return false
    }

    const body = (await response.json()) as { accessToken: string }
    tokenStore.set(body.accessToken)
    return true
  } catch {
    tokenStore.clear()
    return false
  }
}

export function refreshAccessToken(): Promise<boolean> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}
