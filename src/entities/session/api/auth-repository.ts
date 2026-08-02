import { httpClient } from '@/shared/api'
import type { AuthTokenResponse, SignInRequest } from '../model/types'

export class AuthRepository {
  public static async signIn(body: SignInRequest): Promise<AuthTokenResponse> {
    return httpClient.post<AuthTokenResponse>('/api/sign-in', { body, auth: false })
  }
}
