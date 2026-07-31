import { cn } from '@/shared/lib/utils'

export function KbLogo({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'bg-primary text-primary-foreground flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-extrabold',
        className,
      )}
      {...props}
    >
      KB
    </span>
  )
}
