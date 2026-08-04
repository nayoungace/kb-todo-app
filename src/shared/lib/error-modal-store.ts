type Listener = () => void

let message: string | null = null
const listeners = new Set<Listener>()

function notify() {
  for (const listener of listeners) {
    listener()
  }
}

export const errorModalStore = {
  get(): string | null {
    return message
  },
  show(next: string): void {
    if (message !== null) {
      if (import.meta.env.DEV) {
        console.error('[error-modal] 표시 중인 오류가 있어 버려진 메시지:', next)
      }
      return
    }
    message = next
    notify()
  },
  close(): void {
    if (message === null) return
    message = null
    notify()
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
