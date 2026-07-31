import { Link, useMatchRoute } from '@tanstack/react-router'
import { getAuthNavItem, NAV_MAIN } from '@/shared/config/navigation'
import { ROUTES } from '@/shared/config/routes'
import { useSession } from '@/shared/config/session'
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
            <SidebarMenu>
              {NAV_MAIN.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={Boolean(matchRoute({ to: item.url, fuzzy: item.fuzzy }))}
                    tooltip={item.title}
                  >
                    <Link to={item.url} onClick={closeMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={Boolean(matchRoute({ to: authItem.url }))}
              tooltip={authItem.title}
            >
              <Link to={authItem.url} onClick={closeMobile}>
                <authItem.icon />
                <span>{authItem.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
