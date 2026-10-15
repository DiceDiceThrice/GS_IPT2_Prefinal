import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import AppLayout from '@/components/AppLayout'
import LoadingState from '@/components/LoadingState'

export default function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout />
}
