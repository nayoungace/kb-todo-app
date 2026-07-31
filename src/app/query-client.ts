import { QueryClient } from '@tanstack/react-query'

/**
 * 어드민 성격상 화면 복귀 시마다 재요청하는 기본 동작은 과하므로 refetchOnWindowFocus 를 끄고,
 * 인증 실패(401)는 httpClient 의 refresh 파이프라인이 처리하므로 재시도 횟수는 낮게 잡는다.
 */
export const queryClient = new QueryClient({
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
