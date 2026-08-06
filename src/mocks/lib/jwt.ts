export interface JwtPayload {
  id: number
  exp: number
}

function base64UrlEncode(value: unknown): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

//- 프로덕션과 다름. 서명 없이 디코딩만 가능한 가짜 JWT다(`alg: none` + 고정 문자열).
//  실제 환경이라면 서버가 비밀키로 서명한다.
export function createFakeJwt(payload: JwtPayload): string {
  const header = { alg: 'none', typ: 'JWT' }
  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.mock-signature`
}

export function decodeJwt(token: string): JwtPayload | null {
  const payloadPart = token.split('.')[1]
  if (!payloadPart) return null
  try {
    const json = atob(payloadPart.replaceAll('-', '+').replaceAll('_', '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 <= Date.now()
}
