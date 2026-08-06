import { describe, expect, it } from 'vitest'
import { router } from './router'

function matchedRouteIds(pathname: string) {
  return router.getMatchedRoutes(pathname).matchedRoutes.map((route) => route.id)
}

describe('라우트가 없는 주소', () => {
  it('선언된 화면은 각자의 라우트로 간다', () => {
    expect(matchedRouteIds('/')).toContain('/_app/')
    expect(matchedRouteIds('/task')).toContain('/_app/task/')
    expect(matchedRouteIds('/task/1')).toContain('/_app/task/$id')
    expect(matchedRouteIds('/user')).toContain('/_app/user')
    expect(matchedRouteIds('/sign-in')).toContain('/sign-in')
  })

  it('선언되지 않은 주소는 404 화면으로 간다', () => {
    expect(matchedRouteIds('/foo')).toContain('/$')
    expect(matchedRouteIds('/task/1/bar')).toContain('/$')
  })
})
