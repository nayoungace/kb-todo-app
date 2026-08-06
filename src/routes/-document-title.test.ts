import { describe, expect, it } from 'vitest'
import { APP_NAME, pageTitle } from '@/shared/config/page-title'
import { Route as notFoundRoute } from './$'
import { Route as rootRoute } from './__root'
import { Route as dashboardRoute } from './_app.index'
import { Route as taskDetailRoute } from './_app.task.$id'
import { Route as taskListRoute } from './_app.task.index'
import { Route as userRoute } from './_app.user'
import { Route as signInRoute } from './sign-in'

const routes = [
  { page: '대시보드', route: dashboardRoute },
  { page: '할 일', route: taskListRoute },
  { page: '할 일 상세', route: taskDetailRoute },
  { page: '회원정보', route: userRoute },
  { page: '로그인', route: signInRoute },
  { page: '페이지를 찾을 수 없습니다.', route: notFoundRoute },
]

function titleOf(route: { options: { head?: (ctx: never) => unknown } }) {
  return route.options.head?.(undefined as never)
}

describe('라우트별 document title', () => {
  it('루트는 화면명 없이 앱 이름만 쓴다', () => {
    expect(titleOf(rootRoute)).toEqual({ meta: [{ title: APP_NAME }] })
  })

  it.each(routes)('$page', ({ page, route }) => {
    expect(titleOf(route)).toEqual({ meta: [{ title: pageTitle(page) }] })
  })

  it('모든 화면 라우트가 서로 다른 제목을 가진다', () => {
    const titles = routes.map(({ page }) => pageTitle(page))

    expect(new Set(titles).size).toBe(titles.length)
  })
})
