import { HttpResponse } from 'msw'
import { decodeJwt, isExpired, type JwtPayload } from './jwt'

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
