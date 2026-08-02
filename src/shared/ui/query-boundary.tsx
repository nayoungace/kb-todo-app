import type { ReactNode } from 'react'
import { ErrorState } from './error-state'

interface QueryLike<T> {
  data: T | undefined
  isPending: boolean
  isError: boolean
  refetch: () => unknown
}

interface QueryBoundaryProps<T> {
  query: QueryLike<T>
  skeleton: ReactNode
  children: (data: T) => ReactNode
}

export function QueryBoundary<T>({ query, skeleton, children }: QueryBoundaryProps<T>): ReactNode {
  if (query.isPending) return skeleton
  if (query.isError && query.data === undefined) {
    return <ErrorState onRetry={() => void query.refetch()} />
  }
  return children(query.data as T)
}
