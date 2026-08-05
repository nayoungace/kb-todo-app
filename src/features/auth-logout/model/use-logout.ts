import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { clearSession } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'

export interface UseLogout {
  logout: () => void
}

export function useLogout(): UseLogout {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return {
    logout: () => {
      clearSession()
      void navigate({ to: ROUTES.SIGN_IN }).then(() => {
        queryClient.clear()
      })
    },
  }
}
