export type Role = 'admin' | 'staff'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  active: number
  created_at: string
}

export interface Category {
  id: number
  name: string
  active: number
}

export interface Party {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  active: number
}

export type Supplier = Party
export type Customer = Party

export interface Product {
  id: number
  name: string
  category_id: number
  description: string | null
  material: string | null
  image_url: string | null
  active: number
}

export interface Variant {
  id: number
  product_id: number
  sku: string
  color: string
  size: string
  dimensions: string | null
  cost: number
  selling_price: number
  reorder_level: number
  stock: number
  active: number
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number
  quantity: number
  returned_quantity: number
  unit_price: number
  sku?: string
}

export interface Order {
  id: number
  type: 'purchase' | 'sale'
  supplier_id: number | null
  customer_id: number | null
  total: number
  notes: string | null
  created_by: number
  created_at: string
  items?: OrderItem[]
  returns?: Return[]
}

export interface StockMovement {
  id: number
  variant_id: number
  quantity: number
  balance: number
  type: 'purchase' | 'sale' | 'adjustment' | 'sale_return' | 'purchase_return'
  order_id: number | null
  reason: string | null
  created_by: number
  created_at: string
}

export interface StockAdjustment {
  variant_id: number
  quantity: number
  reason: string
}

export interface Return {
  id: number
  order_id: number
  total: number
  reason: string
  created_by: number
  created_at: string
}

export interface DashboardStock {
  variants: number
  units: number
  inventory_value: number
}

export interface DashboardTransaction {
  type: string
  net_total: number
  order_count: number
}

export interface DashboardReport {
  variants: number
  units: number
  inventory_value: number
  transactions: DashboardTransaction[]
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface LoginResponse {
  token: string
  user: { id: number; name: string; email: string; role: Role }
}
