import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/admin/auth/login', { email, password });
      const accessToken = response.data?.data?.accessToken;
      const admin = response.data?.data?.admin;
      if (accessToken) localStorage.setItem('bolt_admin_token', accessToken);
      if (admin?.role) localStorage.setItem('bolt_admin_role', admin.role);
      localStorage.setItem('bolt_admin_validated_at', String(Date.now()));
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      if (!status) {
        setError('Network error. Check your connection and try again.');
      } else if (status === 401 || status === 403) {
        setError(err.response?.data?.message || 'Invalid credentials.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/20">
        <h1 className="text-3xl font-bold text-white">Admin Login</h1>
        <p className="mt-2 text-slate-400">Enter credentials to access the admin dashboard.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full p-3" type="email" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full p-3" type="password" required />
          </div>
          {error && <div className="text-sm text-rose-400">{error}</div>}
          <button type="submit" className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500">Sign in</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
