import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const AUTH_VALIDATION_TTL = 5 * 60 * 1000;

const PrivateRoute = () => {
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bolt_admin_token');
    const role = localStorage.getItem('bolt_admin_role');
    const lastValidated = Number(localStorage.getItem('bolt_admin_validated_at') || '0');

    if (!token || !['admin', 'super_admin'].includes(role)) {
      setChecked(true);
      setAuthenticated(false);
      return;
    }

    if (Date.now() - lastValidated < AUTH_VALIDATION_TTL) {
      setChecked(true);
      setAuthenticated(true);
      return;
    }

    api.get('/admin/auth/me')
      .then((response) => {
        if (response.data?.success) {
          localStorage.setItem('bolt_admin_validated_at', String(Date.now()));
          setAuthenticated(true);
        } else {
          throw new Error('Session validation failed');
        }
      })
      .catch(() => {
        localStorage.removeItem('bolt_admin_token');
        localStorage.removeItem('bolt_admin_role');
        localStorage.removeItem('bolt_admin_validated_at');
        notifyToast('Session invalid. Please log in again.');
        setAuthenticated(false);
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center">Checking session...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
