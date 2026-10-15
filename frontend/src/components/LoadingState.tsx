import { Loader2 } from 'lucide-react'

export default function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
