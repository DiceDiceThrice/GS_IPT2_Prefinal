import { useMemo } from 'react'
import { CrudPage } from '@/components/CrudPage'
import { TextField, TextareaField, SelectField } from '@/components/form-fields'
import { Badge } from '@/components/ui/badge'
import { SelectItem } from '@/components/ui/select'
import { categories, products } from '@/api/hooks'
import type { ProductForm } from '@/api/hooks'
import type { Product } from '@/types'
import type { Column } from '@/components/DataTable'
import { ProductSchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function ProductsPage() {
  const { can } = useAuth()
  const { data: catRes } = categories.useList({ limit: 100, page: 1 })
  const catMap = useMemo(() => new Map((catRes?.data ?? []).map((c) => [c.id, c.name])), [catRes])

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'category_id',
      header: 'Category',
      cell: (r) => <span>{catMap.get(r.category_id) ?? `#${r.category_id}`}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      cell: (r) => (r.active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
  ]

  return (
    <CrudPage<Product, ProductForm, ProductForm>
      title="Products"
      singular="Product"
      resource={products}
      schema={ProductSchema}
      columns={columns}
      canCreate={can.admin}
      canEdit={can.admin}
      canDelete={can.admin}
      createDefaultValues={{ description: null, material: null, image_url: null }}
      fields={(form) => (
        <>
          <TextField form={form} name="name" label="Name" />
          <SelectField
            label="Category"
            value={String(form.watch('category_id') ?? '')}
            onValueChange={(v) => form.setValue('category_id', Number(v))}
            placeholder="Select a category"
            error={form.formState.errors.category_id?.message as string | undefined}
          >
            {(catRes?.data ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectField>
          <TextareaField form={form} name="description" label="Description" rows={3} />
          <TextField form={form} name="material" label="Material" />
          <TextField form={form} name="image_url" label="Image URL" placeholder="https://example.com/image.jpg" />
        </>
      )}
    />
  )
}
