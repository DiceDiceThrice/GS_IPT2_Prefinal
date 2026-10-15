import { CrudPage } from '@/components/CrudPage'
import { TextField } from '@/components/form-fields'
import { Badge } from '@/components/ui/badge'
import { categories } from '@/api/hooks'
import type { Category } from '@/types'
import type { CategoryForm } from '@/api/hooks'
import type { Column } from '@/components/DataTable'
import { CategorySchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function CategoriesPage() {
  const { can } = useAuth()
  const columns: Column<Category>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'active',
      header: 'Status',
      cell: (r) => (r.active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
  ]
  return (
    <CrudPage<Category, CategoryForm, CategoryForm>
      title="Categories"
      singular="Category"
      resource={categories}
      schema={CategorySchema}
      columns={columns}
      fields={(form) => <TextField form={form} name="name" label="Name" />}
      canCreate={can.admin}
      canEdit={can.admin}
      canDelete={can.admin}
    />
  )
}
