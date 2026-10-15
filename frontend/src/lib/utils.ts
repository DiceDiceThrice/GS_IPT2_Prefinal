import { cn as _cn } from 'cn'

export const cn = _cn

export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'number' ? value : value ? Number(value) : 0
  if (Number.isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function toTitleCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\s+/g, '')
    .toLowerCase()
    .replace(/\b\p{L}/gu, (m) => m.toUpperCase())
}
