import type { QueryMeta } from '@tanstack/react-query'
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

export function isSilentQueryError(query: { meta?: QueryMeta; state: { data: unknown } }): boolean {
  return query.meta?.hasInlineErrorUi === true && query.state.data !== undefined
}

const MAX_QUERY_RETRIES = 1

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false
  return failureCount < MAX_QUERY_RETRIES
}

function report(error: unknown, scope: 'query' | 'mutation'): void {
  if (!shouldOpenErrorModal(error, scope)) return
  errorModalStore.show(toErrorMessage(error))
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isSilentQueryError(query)) return
      report(error, 'query')
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      report(error, 'mutation')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
    mutations: {
      retry: 0,
    },
  },
})
