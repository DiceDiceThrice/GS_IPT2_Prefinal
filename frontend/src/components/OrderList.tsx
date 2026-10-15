import { useState, useMemo, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DataTable, type Column } from '@/components/DataTable'
import { orders, suppliers, customers, variants, buildError } from '@/api/hooks'
import api from '@/api/client'
import type { Order } from '@/types'
import LoadingState from '@/components/LoadingState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SelectField } from '@/components/form-fields'
import { SelectItem } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Eye, RotateCcw, Pencil, Check, X } from 'lucide-react'
import { showToast } from '@/lib/toast'

export type OrderListType = 'purchase' | 'sale'

interface OrderListProps {
  type: OrderListType
  title: string
}

interface NewOrderItem {
  variant_id: number
  quantity: number
  unit_price: number
}

export default function OrderList({ type, title }: OrderListProps) {
  const { data: rows, isLoading } = orders.useList(type)
  const createOrder = orders.useCreate()

  const isPurchase = type === 'purchase'
  const partyKey = isPurchase ? 'supplier_id' : 'customer_id'
  const partyLabel = isPurchase ? 'Supplier' : 'Customer'

  const { data: partyRes } = isPurchase
    ? suppliers.useList({ limit: 100, page: 1 })
    : customers.useList({ limit: 100, page: 1 })
  const partyMap = useMemo(
    () => new Map((partyRes?.data ?? []).map((p) => [p.id, p.name])),
    [partyRes],
  )

  const { data: variantRes } = variants.useList({ limit: 200, page: 1 })
  const variantList = variantRes?.data ?? []
  const variantMap = useMemo(
    () => new Map((variantRes?.data ?? []).map((v) => [v.id, v])),
    [variantRes],
  )

  // Create Order state
  const [createOpen, setCreateOpen] = useState(false)
  const [partyId, setPartyId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<NewOrderItem[]>([
    { variant_id: 0, quantity: 1, unit_price: 0 },
  ])

  // View Order Details state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const { data: orderDetail, isLoading: detailLoading } = orders.useDetail(
    type,
    selectedOrderId ?? 0,
  )

  // Returns and Notes state
  const returnMutation = orders.useReturn()
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({})
  const [returnReason, setReturnReason] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (orderDetail) {
      setOrderNotes(orderDetail.notes ?? '')
    }
  }, [orderDetail])

  const handleSaveNotes = async () => {
    if (!orderDetail) return
    try {
      setIsSavingNotes(true)
      await api.put(`/${type === 'purchase' ? 'purchases' : 'sales'}/${orderDetail.id}`, {
        notes: orderNotes.trim() || null,
      })
      showToast.success('Notes updated', 'Order notes saved successfully.')
      setEditingNotes(false)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    } catch (err: unknown) {
      showToast.error('Update failed', buildError(err))
    } finally {
      setIsSavingNotes(false)
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderDetail) return
    const validItems = Object.entries(returnQuantities)
      .map(([itemId, qty]) => ({ item_id: Number(itemId), quantity: Number(qty) }))
      .filter((i) => i.quantity > 0)

    if (validItems.length === 0) {
      showToast.error('Items required', 'Please select at least one item and quantity to return.')
      return
    }
    if (!returnReason.trim() || returnReason.trim().length < 3) {
      showToast.error('Reason required', 'Please provide a reason for the return (at least 3 characters).')
      return
    }

    try {
      await returnMutation.mutateAsync({
        type,
        id: orderDetail.id,
        body: { items: validItems, reason: returnReason.trim() },
      })
      showToast.success('Return processed', 'Order return recorded successfully.')
      setReturnOpen(false)
      setReturnQuantities({})
      setReturnReason('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    } catch (err: unknown) {
      showToast.error('Return failed', buildError(err))
    }
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, { variant_id: 0, quantity: 1, unit_price: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVariantChange = (index: number, variantId: number) => {
    const v = variantMap.get(variantId)
    const defaultPrice = isPurchase
      ? Number(v?.cost ?? 0)
      : Number(v?.selling_price ?? 0)
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, variant_id: variantId, unit_price: defaultPrice }
          : item,
      ),
    )
  }

  const handleItemChange = (
    index: number,
    field: 'quantity' | 'unit_price',
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const orderTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPurchase && !partyId) {
      showToast.error('Supplier required', 'Please select a supplier for the purchase.')
      return
    }

    const validItems = items.filter((i) => i.variant_id > 0 && i.quantity > 0)
    if (validItems.length === 0) {
      showToast.error('Items required', 'Please add at least one valid item.')
      return
    }

    // Check for duplicate variants
    const variantIds = validItems.map((i) => i.variant_id)
    if (new Set(variantIds).size !== variantIds.length) {
      showToast.error('Duplicate variants', 'Each item variant must be unique.')
      return
    }

    try {
      await createOrder.mutateAsync({
        type,
        body: {
          party_id: partyId || null,
          notes: notes.trim() || null,
          items: validItems,
        },
      })
      showToast.success(title, `${title.slice(0, -1)} created successfully.`)
      setCreateOpen(false)
      setPartyId(null)
      setNotes('')
      setItems([{ variant_id: 0, quantity: 1, unit_price: 0 }])
    } catch (err: unknown) {
      showToast.error('Order failed', buildError(err))
    }
  }

  const columns: Column<Order>[] = [
    { key: 'id', header: '#' },
    {
      key: partyKey,
      header: partyLabel,
      cell: (r) => (
        <span>
          {r[partyKey] == null
            ? '—'
            : partyMap.get(r[partyKey] as number) ?? `#${r[partyKey]}`}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      cell: (r) => <span>${Number(r.total ?? 0).toFixed(2)}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      cell: (r) => <span>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'items',
      header: 'Actions',
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setSelectedOrderId(r.id)}
        >
          <Eye className="size-4" />
          <span>View</span>
        </Button>
      ),
    },
  ]

  if (isLoading) return <LoadingState />

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <DataTable columns={columns} data={rows} empty={`No ${type}s found.`} />

      {/* Create Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>New {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <SelectField
                label={partyLabel}
                value={partyId ? String(partyId) : ''}
                onValueChange={(val) => setPartyId(val ? Number(val) : null)}
                placeholder={`Select ${partyLabel.toLowerCase()}`}
              >
                {(partyRes?.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectField>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="mr-1 size-3.5" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-end gap-2 rounded-lg border p-2 bg-muted/20"
                    >
                      <div className="flex-1">
                        <Label className="text-xs">Variant</Label>
                        <SelectField
                          value={item.variant_id ? String(item.variant_id) : ''}
                          onValueChange={(v) =>
                            handleVariantChange(index, v ? Number(v) : 0)
                          }
                          placeholder="Select variant"
                        >
                          {variantList.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {v.sku} - {v.color} ({v.size}) [Stock: {v.stock}]
                            </SelectItem>
                          ))}
                        </SelectField>
                      </div>

                      <div className="w-24">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity || ''}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'quantity',
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                        />
                      </div>

                      <div className="w-28">
                        <Label className="text-xs">Unit Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.unit_price ?? ''}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'unit_price',
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>

                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive mb-0.5"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="order-notes">Notes</Label>
                <Input
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes or instructions..."
                />
              </div>

              <div className="flex justify-end text-base font-semibold">
                Total: ${orderTotal.toFixed(2)}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Submitting...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog
        open={selectedOrderId !== null}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {title.slice(0, -1)} Details #{selectedOrderId}
            </DialogTitle>
          </DialogHeader>

          {detailLoading || !orderDetail ? (
            <div className="py-8 text-center text-muted-foreground">Loading details...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">{partyLabel}: </span>
                  <span className="font-medium">
                    {orderDetail[partyKey] == null
                      ? 'N/A'
                      : partyMap.get(orderDetail[partyKey] as number) ??
                        `#${orderDetail[partyKey]}`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-medium">
                    {new Date(orderDetail.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-medium">
                    ${Number(orderDetail.total ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t">
                  {editingNotes ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Order notes..."
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        size="icon-sm"
                        variant="default"
                        type="button"
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        title="Save notes"
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setOrderNotes(orderDetail.notes ?? '')
                          setEditingNotes(false)
                        }}
                        disabled={isSavingNotes}
                        title="Cancel"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground">Notes: </span>
                        <span>{orderDetail.notes || <em className="text-muted-foreground/60">No notes</em>}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        onClick={() => {
                          setOrderNotes(orderDetail.notes ?? '')
                          setEditingNotes(true)
                        }}
                        title="Edit notes"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Returned</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(orderDetail.items ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.sku ?? `#${item.variant_id}`}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {item.returned_quantity > 0 ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                              {item.returned_quantity}
                            </Badge>
                          ) : (
                            '0'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {orderDetail.returns && orderDetail.returns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Returns History</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetail.returns.map((ret) => (
                        <TableRow key={ret.id}>
                          <TableCell className="font-medium">#{ret.id}</TableCell>
                          <TableCell>{new Date(ret.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{ret.reason}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            -${Number(ret.total).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            {orderDetail?.items?.some((i) => i.quantity > (i.returned_quantity || 0)) ? (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setReturnQuantities({})
                  setReturnReason('')
                  setReturnOpen(true)
                }}
              >
                <RotateCcw className="size-4" />
                <span>Process Return</span>
              </Button>
            ) : (
              <div />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedOrderId(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Return Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Process Return for {title.slice(0, -1)} #{orderDetail?.id}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Enter quantity to return for each item. Inventory stock and order totals will be updated automatically.
              </p>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right w-28">Return Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orderDetail?.items ?? [])
                    .filter((item) => item.quantity > (item.returned_quantity || 0))
                    .map((item) => {
                      const maxReturn = item.quantity - (item.returned_quantity || 0)
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-xs">
                            {item.sku ?? `#${item.variant_id}`}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {maxReturn}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              max={maxReturn}
                              value={returnQuantities[item.id] ?? ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0
                                const clamped = Math.max(0, Math.min(maxReturn, val))
                                setReturnQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: clamped,
                                }))
                              }}
                              className="h-8 text-right"
                              placeholder="0"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>

              <div className="space-y-1.5">
                <Label htmlFor="return-reason">Return Reason</Label>
                <Input
                  id="return-reason"
                  placeholder="e.g. Defective item, customer return, audit adjustment"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReturnOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
