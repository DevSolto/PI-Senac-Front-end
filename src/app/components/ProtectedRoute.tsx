import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  children?: ReactNode;
  fallback?: ReactNode;
};

export const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const { status } = useAuth();

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
        {fallback ?? <span>Carregando...</span>}
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
};
