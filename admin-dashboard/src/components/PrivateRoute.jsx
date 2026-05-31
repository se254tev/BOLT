import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('bolt_admin_token');
  const role = localStorage.getItem('bolt_admin_role');
  if (!token || !['admin', 'super_admin'].includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
