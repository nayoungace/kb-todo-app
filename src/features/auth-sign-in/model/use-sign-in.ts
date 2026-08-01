import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AuthRepository, establishSession, type SignInRequest } from '@/entities/session'
import { HttpError } from '@/shared/api'
import { ROUTES } from '@/shared/config/routes'

export interface UseSignIn {
  signIn: (values: SignInRequest) => void
  isPending: boolean
  errorMessage: string | null
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
    // 요구사항 §4.2 대로 서버가 준 errorMessage 를 그대로 노출한다.
    errorMessage: mutation.error instanceof HttpError ? mutation.error.message : null,
  }
}
