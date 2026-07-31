import { useSyncExternalStore } from 'react'
import { getSessionStatus, subscribeSession } from './session-store'
import type { SessionStatus } from './types'

export interface Session {
  status: SessionStatus
  isAuthenticated: boolean
}

export function useSession(): Session {
  const status = useSyncExternalStore(subscribeSession, getSessionStatus)
  return { status, isAuthenticated: status === 'authenticated' }
}
