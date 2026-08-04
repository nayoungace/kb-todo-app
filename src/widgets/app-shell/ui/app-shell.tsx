import { Outlet } from '@tanstack/react-router'
import { AuthGate } from '@/entities/session'
import { SidebarInset, SidebarProvider } from '@/shared/shadcn/ui/sidebar'
import { TooltipProvider } from '@/shared/shadcn/ui/tooltip'
import { useRouteFocus } from '../lib/use-route-focus'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export function AppShell() {
  const contentRef = useRouteFocus<HTMLDivElement>()

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div ref={contentRef} tabIndex={-1} className="flex-1 p-6 outline-none">
            <AuthGate>
              <Outlet />
            </AuthGate>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
