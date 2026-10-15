import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
import { useAuth } from '@/auth/useAuth'
import { showToast } from '@/lib/toast'
import { LoginSchema, type LoginForm } from '@/lib/schemas'

export default function LoginPage() {
  const { user, login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      showToast.success('Signed in successfully')
    } catch {
      showToast.error('Invalid email or password', 'Check your credentials and try again.')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Ken's Marketing</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <LoadingButton type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </LoadingButton>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
