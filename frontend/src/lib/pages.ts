export type RouteKey =
  | 'dashboard'
  | 'users'
  | 'categories'
  | 'suppliers'
  | 'customers'
  | 'products'
  | 'variants'
  | 'purchases'
  | 'sales'
  | 'stock'

export const RouteMap: Record<RouteKey, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  categories: 'Categories',
  suppliers: 'Suppliers',
  customers: 'Customers',
  products: 'Products',
  variants: 'Variants',
  purchases: 'Purchases',
  sales: 'Sales',
  stock: 'Stock',
}

export function pageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const key = (segments[segments.length - 1] ?? 'dashboard') as RouteKey
  return RouteMap[key] ?? "Ken's Marketing"
}
