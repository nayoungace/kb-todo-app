import { Link, useMatchRoute } from '@tanstack/react-router'
import { useSession } from '@/entities/session'
import { getAuthNavItem, NAV_MAIN } from '@/shared/config/navigation'
import { Button } from '@/shared/shadcn/ui/button'
import { SidebarTrigger } from '@/shared/shadcn/ui/sidebar'

export function AppHeader() {
  const matchRoute = useMatchRoute()
  const { isAuthenticated } = useSession()
  const authItem = getAuthNavItem(isAuthenticated)

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <nav aria-label="주요 메뉴" className="hidden lg:flex">
        <ul className="flex items-center gap-1">
          {NAV_MAIN.map((item) => (
            <li key={item.title}>
              <Button variant="ghost" asChild>
                <Link
                  to={item.url}
                  aria-current={
                    matchRoute({ to: item.url, fuzzy: item.fuzzy }) ? 'page' : undefined
                  }
                >
                  <item.icon />
                  {item.title}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link
            to={authItem.url}
            aria-current={matchRoute({ to: authItem.url }) ? 'page' : undefined}
          >
            <authItem.icon />
            {authItem.title}
          </Link>
        </Button>
      </div>
    </header>
  )
}
