import { useContext, useMemo } from 'react'
import { AuthContext, type CurrentUser } from './AuthProvider'
import type { Role } from '@/types'

export function useAuth() {
  const ctx = useContext(AuthContext)
  return useMemo(() => {
    const hasRole = (role: Role) => ctx.user?.role === role
    const can = {
      admin: ctx.user?.role === 'admin',
      staff: !!ctx.user,
    }
    return {
      user: ctx.user,
      token: ctx.token,
      loading: ctx.loading,
      login: ctx.login,
      logout: ctx.logout,
      hasRole,
      can,
    }
  }, [ctx])
}

export type { CurrentUser }
