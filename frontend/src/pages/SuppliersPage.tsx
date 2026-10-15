import { CrudPage } from '@/components/CrudPage'
import { TextField, TextareaField } from '@/components/form-fields'
import { suppliers } from '@/api/hooks'
import type { Supplier } from '@/types'
import type { PartyForm } from '@/api/hooks'
import type { Column } from '@/components/DataTable'
import { SupplierSchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function SuppliersPage() {
  const { can } = useAuth()
  const columns: Column<Supplier>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
  ]
  return (
    <CrudPage<Supplier, PartyForm, PartyForm>
      title="Suppliers"
      singular="Supplier"
      resource={suppliers}
      schema={SupplierSchema}
      columns={columns}
      fields={(form) => (
        <>
          <TextField form={form} name="name" label="Name" />
          <TextField form={form} name="email" label="Email" type="email" />
          <TextField form={form} name="phone" label="Phone" />
          <TextareaField form={form} name="address" label="Address" />
        </>
      )}
      canCreate={can.admin}
      canEdit={can.admin}
      canDelete={can.admin}
    />
  )
}
