import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/api/client'
import type { User } from '@/types'

export type CurrentUser = Pick<User, 'id' | 'name' | 'email' | 'role'>

export interface AuthState {
  user: CurrentUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => {
    throw new Error('AuthProvider not mounted')
  },
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common.Authorization
    setUser(null)
    setToken(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ token: string; user: CurrentUser }>('/auth/login', {
        email,
        password,
      })
      localStorage.setItem('token', data.token)
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard', { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) {
      setLoading(false)
      return
    }
    api.defaults.headers.common.Authorization = `Bearer ${stored}`
    api
      .get<CurrentUser>('/auth/me')
      .then((res) => {
        setToken(stored)
        setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        delete api.defaults.headers.common.Authorization
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}
