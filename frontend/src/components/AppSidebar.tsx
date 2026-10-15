import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useSidebar } from '@/components/SidebarState'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import SidebarNav from '@/components/SidebarNav'

interface UserFooterProps {
  user: { name?: string; email?: string; role?: string } | null
  onSignOut: () => void
}

function UserFooter({ user, onSignOut }: UserFooterProps) {
  return (
    <div className="mt-auto border-t bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-col truncate pr-2">
          <span className="truncate text-xs font-semibold text-foreground">{user?.name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{user?.email}</span>
        </div>
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary capitalize">
          {user?.role}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onSignOut}
      >
        <LogOut className="size-4" />
        <span>Sign out</span>
      </Button>
    </div>
  )
}

export default function AppSidebar() {
  const { open, setOpen } = useSidebar()
  const { user, logout } = useAuth()

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-5">
          <span className="text-xl font-semibold text-primary">Ken's Marketing</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav />
        </div>
        <UserFooter user={user} onSignOut={logout} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="z-[90] flex w-64 max-w-64 flex-col gap-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-16 items-center border-b px-5">
            <span className="text-xl font-semibold text-primary">Ken's Marketing</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav />
          </div>
          <UserFooter
            user={user}
            onSignOut={() => {
              setOpen(false)
              logout()
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
