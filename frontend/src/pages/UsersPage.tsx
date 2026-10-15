import { CrudPage } from '@/components/CrudPage'
import { TextField, SelectField } from '@/components/form-fields'
import { Badge } from '@/components/ui/badge'
import { SelectItem } from '@/components/ui/select'
import { users } from '@/api/hooks'
import type { UserForm, UpdateUserBody } from '@/api/hooks'
import type { User, Role } from '@/types'
import type { Column } from '@/components/DataTable'
import { CreateUserSchema, UpdateUserSchema } from '@/lib/schemas'
import { useAuth } from '@/auth/useAuth'

export default function UsersPage() {
  const { can } = useAuth()
  const columns: Column<User>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      cell: (r) => (r.role === 'admin' ? <Badge>Admin</Badge> : <Badge variant="secondary">Staff</Badge>),
    },
    {
      key: 'active',
      header: 'Status',
      cell: (r) => (r.active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>),
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (r) => <span>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ]

  return (
    <CrudPage<User, UserForm, UpdateUserBody>
      title="Users"
      singular="User"
      resource={users}
      schema={CreateUserSchema}
      editSchema={UpdateUserSchema}
      columns={columns}
      canCreate={can.admin}
      canEdit={can.admin}
      canDelete={can.admin}
      editToForm={(row) => ({
        name: row.name,
        email: row.email,
        password: '',
        role: row.role,
        active: Boolean(row.active),
      })}
      fields={(form, isEdit) => (
        <>
          <TextField form={form} name="name" label="Name" placeholder="Full name" />
          <TextField form={form} name="email" label="Email" type="email" placeholder="user@example.com" />
          <TextField
            form={form}
            name="password"
            label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            placeholder={isEdit ? '•••••••• (optional)' : 'Minimum 8 characters'}
          />
          <SelectField
            label="Role"
            value={form.watch('role') ?? ''}
            onValueChange={(v) => form.setValue('role', v as Role)}
            placeholder="Select a role"
            error={form.formState.errors.role?.message as string | undefined}
          >
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectField>
          {isEdit && (
            <SelectField
              label="Status"
              value={form.watch('active') ? 'active' : 'inactive'}
              onValueChange={(v) => form.setValue('active', v === 'active')}
              placeholder="Select status"
            >
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectField>
          )}
        </>
      )}
    />
  )
}
