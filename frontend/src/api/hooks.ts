import { useQueryClient, useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import api from './client'
import type {
  Category,
  Customer,
  DashboardReport,
  ListResponse,
  LoginResponse,
  Order,
  Product,
  Return,
  StockAdjustment,
  StockMovement,
  Supplier,
  User,
  Variant,
  Role,
} from '@/types'

export interface ListParams {
  page?: number
  limit?: number
  search?: string
}

export function buildError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error) {
    return (err as { response: { data: { error: string } } }).response.data.error
  }
  return 'Something went wrong'
}

function createCrud<Resource, Create, Update>(path: string, key: string) {
  return {
    useList: (params: ListParams = {}) =>
      useQuery<ListResponse<Resource>>({
        queryKey: [key, 'list', params],
        queryFn: async () => {
          const q = new URLSearchParams()
          if (params.page) q.set('page', String(params.page))
          if (params.limit) q.set('limit', String(params.limit))
          if (params.search) q.set('search', params.search)
          const qs = q.toString()
          const res = (await api.get(`/${path}${qs ? `?${qs}` : ''}`)).data
          if (Array.isArray(res)) {
            const filtered = params.search
              ? res.filter((item: Record<string, unknown>) =>
                  Object.values(item).some((v) =>
                    String(v).toLowerCase().includes(params.search!.toLowerCase()),
                  ),
                )
              : res
            return {
              data: filtered as Resource[],
              total: filtered.length,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          }
          return res as ListResponse<Resource>
        },
        staleTime: 60_000,
      }),
    useDetail: (id: number, opts?: Omit<UseQueryOptions<Resource>, 'queryKey' | 'queryFn'>) =>
      useQuery<Resource>({
        queryKey: [key, 'detail', id],
        queryFn: () => api.get<Resource>(`/${path}/${id}`).then((r) => r.data),
        ...opts,
      }),
    useCreate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (body: Create) => api.post<Resource>(`/${path}`, body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      })
    },
    useUpdate: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: ({ id, body }: { id: number; body: Update }) =>
          api.put<Resource>(`/${path}/${id}`, body).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      })
    },
    useRemove: () => {
      const qc = useQueryClient()
      return useMutation({
        mutationFn: (id: number) => api.delete(`${path}/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
      })
    },
  }
}

export const health = {
  useHealth: () =>
    useQuery({
      queryKey: ['health'],
      queryFn: () => api.get<{ status: string; shop: string }>('/health').then((r) => r.data),
      retry: false,
    }),
}

export const auth = {
  useMe: () =>
    useQuery<User & { role: Role }>({
      queryKey: ['auth', 'me'],
      queryFn: () => api.get<User>('/auth/me').then((r) => r.data),
      retry: false,
    }),
  useLogin: () =>
    useMutation({
      mutationFn: (body: { email: string; password: string }) =>
        api.post<LoginResponse>('/auth/login', body).then((r) => r.data),
    }),
}

export const users = {
  ...createCrud<User, UserForm, UpdateUserBody>('users', 'users'),
}

export const categories = createCrud<Category, CategoryForm, CategoryForm>('categories', 'categories')
export const suppliers = createCrud<Supplier, PartyForm, PartyForm>('suppliers', 'suppliers')
export const customers = createCrud<Customer, PartyForm, PartyForm>('customers', 'customers')
export const products = createCrud<Product, ProductForm, ProductForm>('products', 'products')
export const variants = createCrud<Variant, VariantForm, VariantForm>('variants', 'variants')

export const orders = {
  useList: (type: 'purchase' | 'sale') =>
    useQuery<Order[]>({
      queryKey: ['orders', type],
      queryFn: () => api.get<Order[]>(`/${type === 'purchase' ? 'purchases' : 'sales'}`).then((r) => r.data),
      staleTime: 60_000,
    }),
  useDetail: (type: 'purchase' | 'sale', id: number) =>
    useQuery<Order>({
      queryKey: ['orders', type, id],
      queryFn: () =>
        api.get<Order>(`/${type === 'purchase' ? 'purchases' : 'sales'}/${id}`).then((r) => r.data),
    }),
  useCreate: () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ type, body }: { type: 'purchase' | 'sale'; body: OrderForm }) =>
        api
          .post<{ id: number; type: string; total: number }>(
            `/${type === 'purchase' ? 'purchases' : 'sales'}`,
            body,
          )
          .then((r) => r.data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['orders'] })
      },
    })
  },
  useReturn: () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ type, id, body }: { type: 'purchase' | 'sale'; id: number; body: ReturnForm }) =>
        api
          .post<Return>(`/${type === 'purchase' ? 'purchases' : 'sales'}/${id}/returns`, body)
          .then((r) => r.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    })
  },
}

export const stock = {
  useMovements: (variantId?: number) =>
    useQuery<StockMovement[]>({
      queryKey: ['stock', 'movements', variantId],
      queryFn: () =>
        api
          .get<StockMovement[]>(`/stock/movements${variantId ? `?variant_id=${variantId}` : ''}`)
          .then((r) => r.data),
    }),
  useLow: () =>
    useQuery<Variant[]>({
      queryKey: ['stock', 'low'],
      queryFn: () => api.get<Variant[]>('/stock/low').then((r) => r.data),
    }),
  useAdjust: () => {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (body: StockAdjustment) => api.post('/stock/adjustments', body).then((r) => r.data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['stock'] })
        qc.invalidateQueries({ queryKey: ['stock', 'low'] })
      },
    })
  },
}

export const reports = {
  useDashboard: () =>
    useQuery<DashboardReport>({
      queryKey: ['reports', 'dashboard'],
      queryFn: () => api.get<DashboardReport>('/reports/dashboard').then((r) => r.data),
    }),
  useInventory: () =>
    useQuery({
      queryKey: ['reports', 'inventory'],
      queryFn: () => api.get('/reports/inventory').then((r) => r.data),
    }),
}

// Form payload types (mirror backend zod schemas)
export interface CategoryForm {
  name: string
}
export interface PartyForm {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}
export interface ProductForm {
  name: string
  category_id: number
  description?: string | null
  material?: string | null
  image_url?: string | null
}
export interface VariantForm {
  product_id: number
  sku: string
  color: string
  size: string
  dimensions?: string | null
  cost: number
  selling_price: number
  reorder_level?: number
}
export interface CreateUserBody {
  name: string
  email: string
  password: string
  role: Role
}
export interface UpdateUserBody {
  name: string
  email: string
  password?: string
  role: Role
  active?: boolean | number
}
export interface UserForm {
  name: string
  email: string
  password?: string
  role: Role
  active?: boolean | number
}
export interface OrderItemForm {
  variant_id: number
  quantity: number
  unit_price: number
}
export interface OrderForm {
  party_id?: number | null
  notes?: string | null
  items: OrderItemForm[]
}
export interface ReturnItemForm {
  item_id: number
  quantity: number
}
export interface ReturnForm {
  items: ReturnItemForm[]
  reason: string
}

export interface InventoryRow {
  id: number
  name: string
  sku: string
  color: string
  size: string
  stock: number
  cost: number
  selling_price: number
  product_name: string
  category_name: string
  inventory_value: number
}
