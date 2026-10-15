import AppSidebar from '@/components/AppSidebar'
import AppTopbar from '@/components/AppTopbar'
import { SidebarProvider } from '@/components/SidebarState'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
