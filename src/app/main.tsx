import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from './query-client'
import { router } from './router'
import './styles/global.css'

/**
 * MSW 는 개발/테스트 환경에서만 기동하며, 워커가 요청을 가로챌 준비를 마친 뒤 렌더한다.
 * (핸들러 등록 전에 렌더하면 초기 쿼리가 실제 네트워크로 새어나간다)
 */
async function enableMocking() {
  if (!import.meta.env.DEV) return

  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('#root 엘리먼트를 찾을 수 없습니다.')
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
