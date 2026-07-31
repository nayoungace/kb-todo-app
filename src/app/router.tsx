import { createRouter } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import { queryClient } from './query-client'

/**
 * 라우터 컨텍스트로 queryClient 를 내려 두면 이후 각 라우트의 loader/beforeLoad 에서
 * 데이터 프리페치와 인증 가드를 컴포넌트 렌더 이전에 처리할 수 있다.
 */
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
