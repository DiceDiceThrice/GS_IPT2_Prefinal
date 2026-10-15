import { Navigate } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/components/RootLayout'
import ProtectedLayout from '@/components/ProtectedLayout'
import AdminRoute from '@/components/AdminRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import UsersPage from '@/pages/UsersPage'
import CategoriesPage from '@/pages/CategoriesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import CustomersPage from '@/pages/CustomersPage'
import ProductsPage from '@/pages/ProductsPage'
import VariantsPage from '@/pages/VariantsPage'
import PurchasesPage from '@/pages/PurchasesPage'
import SalesPage from '@/pages/SalesPage'
import StockPage from '@/pages/StockPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'dashboard',
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'users', element: <AdminRoute><UsersPage /></AdminRoute> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'variants', element: <VariantsPage /> },
          { path: 'purchases', element: <PurchasesPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'stock', element: <StockPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
