import type { ReactNode } from 'react'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/shared/shadcn/ui/item'

interface DetailFieldProps {
  name: string
  label: string
  icon: ReactNode
  descriptionClassName?: string
  children: ReactNode
}

export function DetailField({
  name,
  label,
  icon,
  descriptionClassName,
  children,
}: DetailFieldProps) {
  const labelId = `${name}-label`

  return (
    <Item variant="outline" role="group" aria-labelledby={labelId}>
      <ItemMedia variant="icon">{icon}</ItemMedia>
      <ItemContent>
        <ItemTitle id={labelId}>{label}</ItemTitle>
        <ItemDescription className={descriptionClassName}>{children}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
