export interface SessionState {
  isAuthenticated: boolean
}

// TODO: 인증 구현 시 entities/session 으로 옮기고 실제 상태를 반환한다.
export function useSession(): SessionState {
  return { isAuthenticated: false }
}
