import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import LoadingState from '@/components/LoadingState'

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { can, loading } = useAuth()
  if (loading) return <LoadingState />
  if (!can.admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
