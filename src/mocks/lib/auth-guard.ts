import { HttpResponse } from 'msw'
import { decodeJwt, isExpired, type JwtPayload } from './jwt'

//- 프로덕션과 다름. 서명을 검증하지 않고 `exp`만 확인한다. 실제 환경이라면 서명 검증이 먼저다.
export function requireAuth(request: Request): JwtPayload | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const payload = decodeJwt(authHeader.slice('Bearer '.length))
  if (!payload || isExpired(payload)) return null
  return payload
}

export function unauthorized() {
  return HttpResponse.json({ errorMessage: '인증이 필요합니다' }, { status: 401 })
}
