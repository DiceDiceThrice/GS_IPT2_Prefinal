import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  Users2,
  Warehouse,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  admin?: boolean
}

const items: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/categories', label: 'Categories', icon: Tag },
  { to: '/dashboard/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/variants', label: 'Variants', icon: Layers },
  { to: '/dashboard/purchases', label: 'Purchases', icon: ShoppingBasket },
  { to: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
  { to: '/dashboard/stock', label: 'Stock', icon: Warehouse },
  { to: '/dashboard/users', label: 'Users', icon: Users2, admin: true },
]

export default function SidebarNav() {
  const { can } = useAuth()
  const { pathname } = useLocation()
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {items.map((item) => {
        if (item.admin && !can.admin) return null
        const active =
          item.to === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.to || pathname.startsWith(item.to + '/')
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
