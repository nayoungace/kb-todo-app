import { httpClient } from '@/shared/api'
import type { AuthTokenResponse, SignInRequest } from '../model/types'

export class AuthRepository {
  public static async signIn(body: SignInRequest): Promise<AuthTokenResponse> {
    return httpClient.post<AuthTokenResponse>('/api/sign-in', { body, auth: false })
  }

  // 자의적 결정: 명세에는 sign-out이 없지만, HttpOnly refresh 쿠키는 서버만 만료시킬 수
  // 있으므로 무효화 엔드포인트를 추가해 호출한다. 백엔드 계약에 반영이 필요한 명세 공백이다.
  public static async signOut(): Promise<void> {
    return httpClient.post<void>('/api/sign-out', { auth: false })
  }
}
