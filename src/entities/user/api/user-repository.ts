import { httpClient } from '@/shared/api'
import type { UserResponse } from '../model/types'

export class UserRepository {
  public static async getProfile(signal?: AbortSignal): Promise<UserResponse> {
    return httpClient.get<UserResponse>('/api/user', { signal })
  }
}
