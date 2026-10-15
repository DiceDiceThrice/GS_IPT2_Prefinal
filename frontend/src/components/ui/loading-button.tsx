import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'

export function LoadingButton({ loading, children, ...props }: { loading?: boolean } & ButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  )
}
