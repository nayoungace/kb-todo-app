import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { userQueries } from '@/entities/user'
import { useLogout } from '@/features/auth-logout'
import { Button } from '@/shared/shadcn/ui/button'
import { QueryBoundary } from '@/shared/ui/query-boundary'
import { UserProfileCard } from './user-profile-card'
import { UserSkeleton } from './user-skeleton'

export function UserPage() {
  const profile = useQuery(userQueries.profile())
  const { logout } = useLogout()

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">회원정보</h1>

      <QueryBoundary query={profile} skeleton={<UserSkeleton />}>
        {(data) => <UserProfileCard user={data} />}
      </QueryBoundary>

      <Button variant="outline" className="self-end" onClick={logout}>
        <LogOut />
        로그아웃
      </Button>
    </section>
  )
}
