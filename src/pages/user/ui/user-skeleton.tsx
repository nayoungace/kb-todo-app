import { UserProfileCardSkeleton } from './user-profile-card'

export function UserSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="회원정보를 불러오는 중">
      <UserProfileCardSkeleton />
    </div>
  )
}
