type Listener = () => void

let accessToken: string | null = null
const listeners = new Set<Listener>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export const tokenStore = {
  get(): string | null {
    return accessToken
  },
  set(token: string): void {
    accessToken = token
    notify()
  },
  clear(): void {
    if (accessToken === null) return
    accessToken = null
    notify()
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
