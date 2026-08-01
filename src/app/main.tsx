import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { bootstrapSession } from '@/entities/session'
import { queryClient } from './query-client'
import { router } from './router'
import './styles/global.css'

// 실제 백엔드가 없어 MSW 가 그 역할을 대신하므로 프로덕션 빌드에서도 기동한다.
async function enableMocking() {
  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('#root 엘리먼트를 찾을 수 없습니다.')
}

void enableMocking().then(() => {
  void bootstrapSession()

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
