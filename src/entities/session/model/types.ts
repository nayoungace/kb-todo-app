export interface SignInRequest {
  email: string
  password: string
}

export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
}

export type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated'
