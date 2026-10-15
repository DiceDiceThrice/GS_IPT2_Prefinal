import type { ReactNode } from 'react'
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label?: string
  className?: string
}

function fieldError<T extends FieldValues>(form: UseFormReturn<T>, name: Path<T>): string | undefined {
  return form.formState.errors[name]?.message as string | undefined
}

export function TextField<T extends FieldValues>({ form, name, label, className, ...props }: FieldProps<T> & Omit<React.ComponentProps<'input'>, 'form'>) {
  const error = fieldError(form, name)
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input id={name} aria-invalid={!!error} {...form.register(name)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function NumberField<T extends FieldValues>({ form, name, label, className, ...props }: FieldProps<T> & Omit<React.ComponentProps<'input'>, 'form'>) {
  const error = fieldError(form, name)
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input id={name} type="number" aria-invalid={!!error} {...form.register(name, { valueAsNumber: true })} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function TextareaField<T extends FieldValues>({ form, name, label, className, rows = 3, ...props }: FieldProps<T> & Omit<React.ComponentProps<'textarea'>, 'form'> & { rows?: number }) {
  const error = fieldError(form, name)
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea id={name} rows={rows} aria-invalid={!!error} {...form.register(name)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export interface SelectFieldProps {
  label?: string
  value?: string
  onValueChange?: (value: string | null) => void
  placeholder?: string
  error?: string
  className?: string
  children: ReactNode
  disabled?: boolean
}

export function SelectField({ label, value, onValueChange, placeholder, error, className, children, disabled }: SelectFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label className="mb-1 block">{label}</Label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="flex items-end gap-3">{children}</div>
}
