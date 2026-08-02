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
    if (message !== null) return
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
