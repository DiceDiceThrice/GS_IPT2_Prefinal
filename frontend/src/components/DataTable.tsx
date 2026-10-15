import { type ReactNode, type Key } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface Column<T> {
  key: string
  header: string
  cell?: (row: T) => ReactNode
  sortable?: boolean
  headerClassName?: string
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[] | undefined
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  actions?: (row: T) => ReactNode
  rowKey?: Key | ((row: T) => Key)
  empty?: ReactNode
  isLoading?: boolean
}

export function DataTable<T>({
  columns,
  data,
  sortKey,
  sortDir,
  onSort,
  actions,
  rowKey = (r: T): Key => {
    if (typeof r === 'object' && r !== null && 'id' in r) {
      return (r as { id: Key }).id
    }
    return String(r)
  },
  empty = 'No results found.',
}: DataTableProps<T>) {
  const rows = data ?? []
  const get = (r: T, k: string): ReactNode => {
    const parts = k.split('.')
    let v: unknown = r
    for (const p of parts) v = (v as Record<string, unknown> | null | undefined)?.[p]
    return v == null ? null : String(v)
  }
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.key} className={cn('h-9', c.headerClassName)}>
                {c.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(c.key)}
                    className="flex items-center gap-1 font-medium text-foreground hover:text-accent-foreground"
                  >
                    {c.header}
                    {sortKey === c.key && (sortDir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
                  </button>
                ) : (
                  c.header
                )}
              </TableHead>
            ))}
            {actions ? <TableHead className="w-12" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span>{empty}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={String(typeof rowKey === 'function' ? rowKey(row) : rowKey)} className="table-row-link">
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn('h-10', c.className)}>
                    {c.cell ? c.cell(row) : get(row, c.key)}
                  </TableCell>
                ))}
                {actions ? <TableCell className="w-12">{actions(row)}</TableCell> : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
