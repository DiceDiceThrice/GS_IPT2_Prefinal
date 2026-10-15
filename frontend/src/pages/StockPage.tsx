import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SelectField } from '@/components/form-fields'
import { SelectItem } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/DataTable'
import { products, stock, variants, buildError } from '@/api/hooks'
import type { Variant, StockMovement } from '@/types'
import LoadingState from '@/components/LoadingState'
import { useAuth } from '@/auth/useAuth'
import { Plus } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function StockPage() {
  const { can } = useAuth()
  const { data: low, isLoading: lowLoading } = stock.useLow()
  const { data: movements, isLoading: mvLoading } = stock.useMovements()
  const { data: prodRes } = products.useList({ limit: 500, page: 1 })
  const prodMap = useMemo(
    () => new Map((prodRes?.data ?? []).map((p) => [p.id, p.name])),
    [prodRes],
  )

  const { data: variantRes } = variants.useList({ limit: 200, page: 1 })
  const variantList = variantRes?.data ?? []
  const variantMap = useMemo(
    () => new Map(variantList.map((v) => [v.id, v])),
    [variantList],
  )

  const adjustStock = stock.useAdjust()
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [variantId, setVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!variantId) {
      showToast.error('Variant required', 'Please select a variant to adjust.')
      return
    }
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty === 0) {
      showToast.error('Invalid quantity', 'Quantity cannot be zero.')
      return
    }
    if (!reason.trim() || reason.trim().length < 3) {
      showToast.error('Reason required', 'Please provide a reason (at least 3 characters).')
      return
    }

    try {
      await adjustStock.mutateAsync({
        variant_id: variantId,
        quantity: qty,
        reason: reason.trim(),
      })
      showToast.success('Stock adjusted', 'Inventory stock adjusted successfully.')
      setAdjustOpen(false)
      setVariantId(null)
      setQuantity('')
      setReason('')
    } catch (err: unknown) {
      showToast.error('Adjustment failed', buildError(err))
    }
  }

  const lowColumns: Column<Variant>[] = [
    { key: 'sku', header: 'SKU' },
    {
      key: 'product_id',
      header: 'Product',
      cell: (r) => <span>{prodMap.get(r.product_id) ?? `#${r.product_id}`}</span>,
    },
    { key: 'color', header: 'Color' },
    { key: 'size', header: 'Size' },
    {
      key: 'stock',
      header: 'Stock',
      cell: (r) => {
        const cls =
          (r.stock ?? 0) <= (r.reorder_level ?? 5)
            ? 'bg-destructive/10 text-destructive'
            : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
        return <Badge className={cls}>{r.stock}</Badge>
      },
    },
    { key: 'reorder_level', header: 'Reorder' },
  ]

  const mvColumns: Column<StockMovement>[] = [
    {
      key: 'variant_id',
      header: 'Variant',
      cell: (r) => {
        const v = variantMap.get(r.variant_id)
        return <span>{v ? `${v.sku} (${v.color})` : `#${r.variant_id}`}</span>
      },
    },
    {
      key: 'type',
      header: 'Type',
      cell: (r) => <Badge variant="secondary" className="capitalize">{r.type.replace('_', ' ')}</Badge>,
    },
    { key: 'quantity', header: 'Qty' },
    { key: 'balance', header: 'Balance' },
    { key: 'reason', header: 'Reason' },
    {
      key: 'created_at',
      header: 'Date',
      cell: (r) => <span>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ]

  if (lowLoading || mvLoading) return <LoadingState />

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Management</h1>
          <p className="text-sm text-muted-foreground">Monitor inventory levels and record adjustments</p>
        </div>
        {can.admin && (
          <Button onClick={() => setAdjustOpen(true)}>
            <Plus className="mr-2 size-4" />
            Adjust Stock
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low stock alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={lowColumns} data={low} empty="No low-stock items." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent movements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {mvColumns.map((c) => (
                  <TableHead key={c.key}>{c.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={mvColumns.length}
                    className="h-20 text-center text-muted-foreground"
                  >
                    No movements recorded.
                  </TableCell>
                </TableRow>
              ) : (
                movements?.map((m) => (
                  <TableRow key={m.id}>
                    {mvColumns.map((c) => (
                      <TableCell key={c.key}>
                        {c.cell
                          ? c.cell(m)
                          : String(m[c.key as keyof StockMovement] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <SelectField
                label="Variant"
                value={variantId ? String(variantId) : ''}
                onValueChange={(val) => setVariantId(val ? Number(val) : null)}
                placeholder="Select variant"
              >
                {variantList.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.sku} - {v.color} ({v.size}) [Current: {v.stock}]
                  </SelectItem>
                ))}
              </SelectField>

              <div className="space-y-1.5">
                <Label htmlFor="adjust-qty">
                  Quantity Change (+ to add, - to reduce)
                </Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  placeholder="e.g. 10 or -5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adjust-reason">Reason</Label>
                <Input
                  id="adjust-reason"
                  placeholder="e.g. Annual audit count or damaged goods"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjustStock.isPending}>
                {adjustStock.isPending ? 'Adjusting...' : 'Confirm Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
