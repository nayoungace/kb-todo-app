import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { HttpError, toErrorMessage } from '@/shared/api'
import { errorModalStore } from '@/shared/lib/error-modal-store'

export function shouldOpenErrorModal(error: unknown, scope: 'query' | 'mutation'): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return false
  if (!(error instanceof HttpError)) return true
  if (error.status === 401 && error.authenticated) return false
  if (scope === 'query' && error.status === 404) return false
  return true
}

function report(error: unknown, scope: 'query' | 'mutation'): void {
  if (!shouldOpenErrorModal(error, scope)) return
  errorModalStore.show(toErrorMessage(error))
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => report(error, 'query'),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent === true) return
      report(error, 'mutation')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
