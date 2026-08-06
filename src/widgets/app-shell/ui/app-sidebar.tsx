import { Link, useMatchRoute } from '@tanstack/react-router'
import { useSession } from '@/entities/session'
import { getAuthNavItem, NAV_MAIN } from '@/shared/config/navigation'
import { ROUTES } from '@/shared/config/routes'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/shared/shadcn/ui/sidebar'
import { KbLogo } from '@/shared/ui/kb-logo'

export function AppSidebar() {
  const matchRoute = useMatchRoute()
  const { isAuthenticated } = useSession()
  const { setOpenMobile } = useSidebar()

  const authItem = getAuthNavItem(isAuthenticated)
  const isAuthItemActive = Boolean(matchRoute({ to: authItem.url }))
  const closeMobile = () => setOpenMobile(false)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              tooltip="KB TODO"
            >
              <Link to={ROUTES.DASHBOARD} onClick={closeMobile}>
                <KbLogo />
                <span className="text-base font-semibold">KB TODO</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <nav aria-label="사이드 메뉴">
              <SidebarMenu>
                {NAV_MAIN.map((item) => {
                  const isActive = Boolean(matchRoute({ to: item.url, fuzzy: item.fuzzy }))

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link
                          to={item.url}
                          onClick={closeMobile}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <nav aria-label="계정">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isAuthItemActive} tooltip={authItem.title}>
                <Link
                  to={authItem.url}
                  onClick={closeMobile}
                  aria-current={isAuthItemActive ? 'page' : undefined}
                >
                  <authItem.icon />
                  <span>{authItem.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </nav>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
