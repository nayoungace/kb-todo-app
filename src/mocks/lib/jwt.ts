export interface JwtPayload {
  id: number
  exp: number
}

function base64UrlEncode(value: unknown): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

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
