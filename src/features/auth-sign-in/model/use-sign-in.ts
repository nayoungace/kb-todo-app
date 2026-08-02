import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AuthRepository, establishSession, type SignInRequest } from '@/entities/session'
import { ROUTES } from '@/shared/config/routes'

export interface UseSignIn {
  signIn: (values: SignInRequest) => void
  isPending: boolean
}

export function useSignIn(): UseSignIn {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: AuthRepository.signIn,
    onSuccess: (tokens) => {
      establishSession(tokens)
      void navigate({ to: ROUTES.DASHBOARD })
    },
  })

  return {
    signIn: mutation.mutate,
    isPending: mutation.isPending,
  }
}
