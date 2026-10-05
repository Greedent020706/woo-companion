import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '../components/DataState';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <LoadingState label="Comprobando sesión…" fullPage />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
