import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data?.users || res.data || []);
    } catch (err) {
      notifyToast('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSuspend = async (id) => {
    const prev = users.slice();
    setUsers((u) => u.map((x) => (x._id === id ? { ...x, suspended: true } : x)));
    try {
      await api.patch(`/admin/users/suspend/${id}`);
      notifyToast('User suspended');
    } catch (err) {
      setUsers(prev);
      notifyToast('Suspend failed');
      throw err;
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/users/${id}`);
      const u = res.data?.user || res.data;
      notifyToast(`User: ${u.name || u.email}`);
    } catch (err) {
      notifyToast('Failed to fetch user');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-600">Suspend, activate, or inspect seller profiles and buyers.</p>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Name</th>
                  <th className="px-4 py-3 text-gray-500">Email</th>
                  <th className="px-4 py-3 text-gray-500">Role</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-4">{user.name || '—'}</td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">{user.role}</td>
                      <td className="px-4 py-4">{user.suspended ? 'Suspended' : 'Active'}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleSuspend(user._id)} successMessage="Suspended">Suspend</Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(user._id)}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UsersPage;
