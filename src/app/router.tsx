import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layout/MainLayout';
import { navigationItems } from './routes';
import { LoginPage } from '@/features/auth/pages/LoginPage';

const defaultPrivatePath = navigationItems[0]?.path ?? '/dashboard';

const normalizePath = (path: string) => (path.startsWith('/') ? path.slice(1) : path);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={defaultPrivatePath} replace />,
      },
      ...navigationItems.map((item) => ({
        path: normalizePath(item.path),
        element: item.element,
      })),
    ],
  },
  {
    path: '*',
    element: <Navigate to={defaultPrivatePath} replace />,
  },
]);
