    import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'DOCENTE' | 'ESTUDIANTE')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  // 1. Si no hay token o sesión, rebota al login inmediatamente
  if (!token || !rawUser) {
    return <Navigate to="/signin" replace />;
  }

  const user = JSON.parse(rawUser);

  // 2. Si la ruta exige roles específicos y el usuario no lo tiene, redirige según su naturaleza
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si un estudiante intenta entrar al dashboard, lo mandamos a su simulador
    if (user.rol === 'ESTUDIANTE') {
      return <Navigate to="/simulador" replace />;
    }
    // Para cualquier otro cruce no autorizado, al login
    return <Navigate to="/signin" replace />;
  }

  // 3. Si pasa los filtros, renderiza los componentes hijos (las rutas internas)
  return <Outlet />;
};

export default ProtectedRoute;
