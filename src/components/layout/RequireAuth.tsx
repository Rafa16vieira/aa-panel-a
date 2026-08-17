import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export function RequireAuth() {
  const session = useAuthStore((s) => s.session);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const session = useAuthStore((s) => s.session);

  if (!session?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
