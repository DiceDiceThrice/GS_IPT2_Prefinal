import { useEffect, useState, type ReactNode } from 'react'
import { useForm, type UseFormReturn, type FieldValues, type DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import { useQueryClient, type UseMutationResult, type UseQueryResult, type UseQueryOptions } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type Column } from '@/components/DataTable'
import FormSheet from '@/components/FormSheet'
import DeleteDialog from '@/components/DeleteDialog'
import { showToast } from '@/lib/toast'
import { type ListParams, buildError } from '@/api/hooks'
import type { ListResponse } from '@/types'

export interface Resource<T, TForm, TUpdate> {
  useList: (params?: ListParams) => UseQueryResult<ListResponse<T>>
  useDetail: (id: number, opts?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>) => UseQueryResult<T>
  useCreate: () => UseMutationResult<T, unknown, TForm, unknown>
  useUpdate: () => UseMutationResult<T, unknown, { id: number; body: TUpdate }, unknown>
  useRemove: () => UseMutationResult<unknown, unknown, number, unknown>
}

export interface CrudPageProps<T, TForm extends FieldValues, TUpdate> {
  title: string
  singular: string
  resource: Resource<T, TForm, TUpdate>
  schema: ZodType<any, any>
  editSchema?: ZodType<any, any>
  columns: Column<T>[]
  fields: (form: UseFormReturn<TForm>, isEdit?: boolean) => ReactNode
  createLabel?: string
  editToForm?: (row: T) => TForm
  createDefaultValues?: Partial<TForm>
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function CrudPage<T extends { id: number }, TForm extends FieldValues, TUpdate>({
  title,
  singular,
  resource,
  schema,
  editSchema,
  columns,
  fields,
  createLabel,
  editToForm = (row) => {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) {
      result[k] = v === null ? '' : v
    }
    return result as unknown as TForm
  },
  createDefaultValues,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: CrudPageProps<T, TForm, TUpdate>) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [editRow, setEditRow] = useState<T | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchTerm), 300)
    return () => clearTimeout(id)
  }, [searchTerm])

  const { data: list, isLoading } = resource.useList({ page, limit: 20, search })
  const createMut = resource.useCreate()
  const updateMut = resource.useUpdate()
  const removeMut = resource.useRemove()

  const createForm = useForm<TForm>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultValues as DefaultValues<TForm>,
  })
  const editForm = useForm<TForm>({ resolver: zodResolver(editSchema ?? schema) })

  useEffect(() => {
    if (editRow) editForm.reset(editToForm(editRow))
  }, [editRow, editToForm, editForm])

  const handleCreate = async (data: TForm) => {
    try {
      await createMut.mutateAsync(data)
      showToast.success(singular, `${singular} created.`)
      queryClient.invalidateQueries({ queryKey: [title.toLowerCase()] })
      createForm.reset()
      setCreateOpen(false)
    } catch (err) {
      showToast.error(`Failed to create ${singular.toLowerCase()}`, buildError(err))
    }
  }

  const handleUpdate = async (data: TForm) => {
    try {
      await updateMut.mutateAsync({ id: editRow!.id, body: data as unknown as TUpdate })
      showToast.success(singular, `${singular} updated.`)
      queryClient.invalidateQueries({ queryKey: [title.toLowerCase()] })
      setEditRow(null)
    } catch (err) {
      showToast.error(`Failed to update ${singular.toLowerCase()}`, buildError(err))
    }
  }

  const handleDelete = async (row: T) => {
    try {
      await removeMut.mutateAsync(row.id)
      showToast.success(singular, `${singular} archived.`)
    } catch (err) {
      showToast.error(`Failed to archive ${singular.toLowerCase()}`, buildError(err))
    }
  }

  const total = list?.total ?? 0
  const pages = Math.ceil(total / 20)

  const rowActions = (row: T) => (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <Button variant="ghost" size="icon-sm" onClick={() => setEditRow(row)} aria-label={`Edit ${singular}`}>
          <Edit className="size-4" />
        </Button>
      )}
      {canDelete && (
        <DeleteDialog
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${singular}`}>
              <Trash2 className="size-4" />
            </Button>
          }
          title={`Archive ${singular}?`}
          description={`This will archive ${singular}. Existing records that reference it remain on file.`}
          onConfirm={() => handleDelete(row)}
        />
      )}
    </div>
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'item' : 'items'} total
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            {createLabel ?? `Add ${singular}`}
          </Button>
        )}
      </div>

      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <DataTable
        columns={columns}
        data={list?.data}
        isLoading={isLoading}
        actions={rowActions}
        empty={`No ${title.toLowerCase()} found.`}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total} items</span>
        {pages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="px-2">Page {page} of {pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      <FormSheet<TForm>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={`Add ${singular}`}
        form={createForm}
        loading={createMut.isPending}
        submitLabel="Create"
        onSubmit={handleCreate}
      >
        {fields(createForm, false)}
      </FormSheet>

      {editRow && (
        <FormSheet<TForm>
          open={!!editRow}
          onOpenChange={(open) => (open ? undefined : setEditRow(null))}
          title={`Edit ${singular}`}
          form={editForm}
          loading={updateMut.isPending}
          submitLabel="Save"
          onSubmit={handleUpdate}
        >
          {fields(editForm, true)}
        </FormSheet>
      )}
    </section>
  )
}
