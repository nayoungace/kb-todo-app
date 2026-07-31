import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  queryClient: QueryClient
}

/**
 * 라우트 파일은 코드젠 대상 디렉터리이므로 화면 조립은 FSD 의 pages/widgets 레이어에 두고,
 * 여기서는 연결만 담당한다. (GNB/LNB 위젯은 후속 단계에서 이 레이아웃에 주입)
 */
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-dvh">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
