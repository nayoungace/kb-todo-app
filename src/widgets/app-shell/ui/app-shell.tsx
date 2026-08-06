import { Outlet } from '@tanstack/react-router'
import { AuthGate } from '@/entities/session'
import { SidebarProvider } from '@/shared/shadcn/ui/sidebar'
import { TooltipProvider } from '@/shared/shadcn/ui/tooltip'
import { useRouteFocus } from '../lib/use-route-focus'
import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'

const MAIN_CONTENT_ID = 'main-content'

export function AppShell() {
  const contentRef = useRouteFocus<HTMLElement>()

  return (
    <TooltipProvider delayDuration={0}>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="bg-background ring-ring/50 fixed top-2 left-2 z-50 -translate-y-20 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-transform outline-none focus:translate-y-0 focus-visible:ring-[3px]"
      >
        본문으로 건너뛰기
      </a>
      <SidebarProvider>
        <AppSidebar />
        <div className="bg-background relative flex w-full flex-1 flex-col">
          <AppHeader />
          <main
            id={MAIN_CONTENT_ID}
            ref={contentRef}
            tabIndex={-1}
            className="flex-1 p-6 outline-none"
          >
            <AuthGate>
              <Outlet />
            </AuthGate>
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
