import type { ReactNode } from 'react'
import { IdCard, NotebookPen } from 'lucide-react'
import type { UserResponse } from '@/entities/user'
import { Card, CardContent } from '@/shared/shadcn/ui/card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/shared/shadcn/ui/item'
import { Skeleton } from '@/shared/shadcn/ui/skeleton'

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
      <Item variant="outline">
        <ItemMedia variant="icon">
          <IdCard />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>이름</ItemTitle>
          <ItemDescription>{user.name}</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <NotebookPen />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>메모</ItemTitle>
          <ItemDescription>{user.memo}</ItemDescription>
        </ItemContent>
      </Item>
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
