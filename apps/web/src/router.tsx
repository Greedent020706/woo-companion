import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoadingState } from './components/DataState';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        hydrateFallbackElement: <LoadingState />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/DashboardPage')).DashboardPage,
            }),
          },
          {
            path: 'products',
            lazy: async () => ({ Component: (await import('./pages/ProductsPage')).ProductsPage }),
          },
          {
            path: 'products/new',
            lazy: async () => ({
              Component: (await import('./pages/ProductFormPage')).ProductFormPage,
            }),
          },
          {
            path: 'products/:productId/edit',
            lazy: async () => ({
              Component: (await import('./pages/ProductFormPage')).ProductFormPage,
            }),
          },
          {
            path: 'orders',
            lazy: async () => ({ Component: (await import('./pages/OrdersPage')).OrdersPage }),
          },
          {
            path: 'orders/:orderId',
            lazy: async () => ({
              Component: (await import('./pages/OrderDetailPage')).OrderDetailPage,
            }),
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
