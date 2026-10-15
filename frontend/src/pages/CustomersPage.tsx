import { CrudPage } from '@/components/CrudPage'
import { TextField, TextareaField } from '@/components/form-fields'
import { customers } from '@/api/hooks'
import type { Customer } from '@/types'
import type { PartyForm } from '@/api/hooks'
import type { Column } from '@/components/DataTable'
import { CustomerSchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function CustomersPage() {
  const { can } = useAuth()
  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
  ]
  return (
    <CrudPage<Customer, PartyForm, PartyForm>
      title="Customers"
      singular="Customer"
      resource={customers}
      schema={CustomerSchema}
      columns={columns}
      fields={(form) => (
        <>
          <TextField form={form} name="name" label="Name" />
          <TextField form={form} name="email" label="Email" type="email" />
          <TextField form={form} name="phone" label="Phone" />
          <TextareaField form={form} name="address" label="Address" />
        </>
      )}
      canCreate
      canEdit
      canDelete={can.admin}
    />
  )
}
