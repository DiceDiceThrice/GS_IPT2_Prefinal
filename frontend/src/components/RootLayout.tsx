import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthProvider'
import { Toaster } from '@/components/ui/toast'

export default function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-svh bg-background">
        <Outlet />
      </div>
      <Toaster />
    </AuthProvider>
  )
}
