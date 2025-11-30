import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ isAllowed, children, redirectTo = "/" }) {
  // Si NO está permitido (no hay token o no tiene rol), redirige
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si está permitido, renderiza los hijos (la página solicitada) o el Outlet
  return children ? children : <Outlet />;
}