import { useQuery } from '@tanstack/react-query'
import { userQueries } from '@/entities/user'
import { QueryBoundary } from '@/shared/ui/query-boundary'
import { UserProfileCard } from './user-profile-card'
import { UserSkeleton } from './user-skeleton'

export function UserPage() {
  const profile = useQuery(userQueries.profile())

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">회원정보</h1>

      <QueryBoundary query={profile} skeleton={<UserSkeleton />}>
        {(data) => <UserProfileCard user={data} />}
      </QueryBoundary>
    </section>
  )
}
