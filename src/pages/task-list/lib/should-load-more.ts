interface LoadMoreInput {
  lastRenderedIndex: number | undefined
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasError: boolean
}

export function shouldLoadMore({
  lastRenderedIndex,
  total,
  hasNextPage,
  isFetchingNextPage,
  hasError,
}: LoadMoreInput): boolean {
  if (!hasNextPage || isFetchingNextPage || hasError) return false
  if (lastRenderedIndex === undefined) return false
  return lastRenderedIndex >= total - 1
}
