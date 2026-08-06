import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AuthRepository, clearSession } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'

export interface UseLogout {
  logout: () => void
}

export function useLogout(): UseLogout {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return {
    logout: () => {
      // 서버 무효화 실패가 로컬 로그아웃을 막지 않도록 결과를 기다리지 않는다
      void AuthRepository.signOut().catch(() => undefined)
      clearSession()
      void navigate({ to: ROUTES.SIGN_IN }).then(() => {
        queryClient.clear()
      })
    },
  }
}
