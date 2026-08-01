import type { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { SEED_ACCOUNT } from '@/mocks/data/db'
import { createFakeJwt } from '@/mocks/lib/jwt'
import { tokenStore } from '@/shared/api'

/** `mocks/` 는 레이어 밖이므로 테스트는 목 내부 대신 이 재노출을 참조한다. */
export const TEST_ACCOUNT = SEED_ACCOUNT

/**
 * gcTime 을 0 으로 두지 말 것. 옵저버가 잠깐 비는 사이 무한 쿼리의 누적 페이지가
 * 수거되어 fetchNextPage 결과가 사라진다. 테스트 간 격리는 매 테스트마다 새 인스턴스를
 * 만드는 것으로 이미 보장된다.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}

export function createQueryWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = createTestQueryClient(),
) {
  return { queryClient, ...render(ui, { wrapper: createQueryWrapper(queryClient) }) }
}

/** setup.ts 가 매 테스트마다 tokenStore 를 비우므로 beforeEach 에서 호출한다. */
export function authenticateForTest(): void {
  tokenStore.set(createFakeJwt({ id: SEED_ACCOUNT.id, exp: Math.floor(Date.now() / 1000) + 60 }))
}
