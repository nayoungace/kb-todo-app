import { queryOptions } from '@tanstack/react-query'
import { UserRepository } from '../api/user-repository'

const userKey = ['user'] as const

export const userQueries = {
  profile: () =>
    queryOptions({
      queryKey: [...userKey, 'profile'] as const,
      queryFn: ({ signal }) => UserRepository.getProfile(signal),
    }),
}
