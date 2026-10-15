import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { ReactNode } from 'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'

export interface FormSheetProps<T extends FieldValues> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  form: UseFormReturn<T>
  loading?: boolean
  submitLabel?: string
  children: ReactNode
  onSubmit: (data: T) => void | Promise<void>
}

export default function FormSheet<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  form,
  loading,
  submitLabel = 'Save',
  children,
  onSubmit,
}: FormSheetProps<T>) {
  const { handleSubmit } = form
  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
    onOpenChange(false)
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          {children}
          <SheetFooter>
            <SheetClose render={<Button variant="outline" type="button">Cancel</Button>} />
            <LoadingButton type="submit" loading={loading}>
              {submitLabel}
            </LoadingButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
