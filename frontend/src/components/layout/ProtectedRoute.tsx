import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export function ProtectedRoute() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div className="boot">Abrindo a agenda…</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Outlet />;
}
