import { useMemo } from 'react'
import { CrudPage } from '@/components/CrudPage'
import { TextField, NumberField, SelectField } from '@/components/form-fields'
import { Badge } from '@/components/ui/badge'
import { SelectItem } from '@/components/ui/select'
import { products, variants } from '@/api/hooks'
import type { VariantForm } from '@/api/hooks'
import type { Variant } from '@/types'
import type { Column } from '@/components/DataTable'
import { VariantSchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function VariantsPage() {
  const { can } = useAuth()
  const { data: prodRes } = products.useList({ limit: 200, page: 1 })
  const prodMap = useMemo(() => new Map((prodRes?.data ?? []).map((p) => [p.id, p.name])), [prodRes])

  const columns: Column<Variant>[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'color', header: 'Color' },
    { key: 'size', header: 'Size' },
    {
      key: 'product_id',
      header: 'Product',
      cell: (r) => <span>{prodMap.get(r.product_id) ?? `#${r.product_id}`}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      cell: (r) => {
        const low = r.stock <= r.reorder_level
        const cls =
          r.stock === 0
            ? 'bg-destructive/10 text-destructive'
            : low
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
              : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200'
        return <Badge className={cls}>{r.stock}</Badge>
      },
    },
    { key: 'selling_price', header: 'Price' },
  ]

  return (
    <CrudPage<Variant, VariantForm, VariantForm>
      title="Variants"
      singular="Variant"
      resource={variants}
      schema={VariantSchema}
      columns={columns}
      canCreate={can.admin}
      canEdit={can.admin}
      canDelete={can.admin}
      createDefaultValues={{ reorder_level: 5 }}
      fields={(form) => (
        <>
          <SelectField
            label="Product"
            value={String(form.watch('product_id') ?? '')}
            onValueChange={(v) => form.setValue('product_id', Number(v))}
            placeholder="Select a product"
            error={form.formState.errors.product_id?.message as string | undefined}
          >
            {(prodRes?.data ?? []).map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectField>
          <TextField form={form} name="sku" label="SKU" />
          <div className="grid grid-cols-2 gap-4">
            <TextField form={form} name="color" label="Color" />
            <TextField form={form} name="size" label="Size" />
          </div>
          <TextField form={form} name="dimensions" label="Dimensions" />
          <NumberField form={form} name="cost" label="Cost" />
          <NumberField form={form} name="selling_price" label="Selling price" />
          <NumberField form={form} name="reorder_level" label="Reorder level" />
        </>
      )}
    />
  )
}
