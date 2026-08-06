import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { bootstrapSession } from '@/entities/session'
import { ErrorModal } from '@/shared/ui/error-modal'
import { queryClient } from './query-client'
import { router } from './router'
import './styles/global.css'

//- 프로덕션과 다름. 배포된 결과물도 목 서버 위에서 동작해야 하므로 환경 분기 없이 MSW를 기동한다.
//  실제 환경이라면 dev 전용이거나 아예 없는 코드다.
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
        <ErrorModal />
      </QueryClientProvider>
    </StrictMode>,
  )
})
