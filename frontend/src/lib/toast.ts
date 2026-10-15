import { toast } from '@/components/ui/toast'

export const showToast = {
  success: (title: string, description?: string) =>
    toast.add({ title, description, type: 'success' as const, timeout: 3000 }),
  error: (title: string, description?: string) =>
    toast.add({ title, description, type: 'error' as const }),
  info: (title: string, description?: string) =>
    toast.add({ title, description, type: 'info' as const }),
  warning: (title: string, description?: string) =>
    toast.add({ title, description, type: 'warning' as const }),
  promise: <T>(
    promise: Promise<T>,
    opts: {
      loading: string
      success: string | ((result: T) => string)
      error: string | ((error: unknown) => string)
    },
  ) => toast.promise(promise, opts),
}
