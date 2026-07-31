import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/shared/shadcn/ui/sidebar'
import { TooltipProvider } from '@/shared/shadcn/ui/tooltip'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

export function AppShell() {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
