import type { ReactNode } from 'react'
import { IdCard, NotebookPen } from 'lucide-react'
import type { UserResponse } from '@/entities/user'
import { Card, CardContent } from '@/shared/shadcn/ui/card'
import { Item, ItemContent, ItemMedia } from '@/shared/shadcn/ui/item'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'
import { DetailField } from '@/shared/ui/detail-field'

interface UserProfileCardProps {
  user: UserResponse
}

function UserProfileCardShell({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <UserProfileCardShell>
      <DetailField name="user-name" label="이름" icon={<IdCard />}>
        {user.name}
      </DetailField>
      <DetailField name="user-memo" label="메모" icon={<NotebookPen />}>
        {user.memo}
      </DetailField>
    </UserProfileCardShell>
  )
}

export function UserProfileCardSkeleton() {
  return (
    <UserProfileCardShell>
      {[0, 1].map((index) => (
        <Item key={index} variant="outline">
          <ItemMedia variant="icon">
            <Skeleton className="size-4" />
          </ItemMedia>
          <ItemContent>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-48" />
          </ItemContent>
        </Item>
      ))}
    </UserProfileCardShell>
  )
}
