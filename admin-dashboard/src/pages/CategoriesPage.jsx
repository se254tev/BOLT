import Sidebar from '../components/Sidebar';

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data?.categories || []);
    } catch (err) {
      notifyToast('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    const prev = categories.slice();
    setCategories((c) => c.filter((x) => x._id !== id));
    try {
      await api.post(`/admin/categories/delete/${id}`);
      notifyToast('Category deleted');
    } catch (err) {
      setCategories(prev);
      notifyToast('Delete failed');
      throw err;
    }
  };

  const handleEdit = async (id, currentName) => {
    const name = window.prompt('Edit category name', currentName);
    if (!name) return;
    try {
      await api.post(`/admin/categories/update/${id}`, { name });
      setCategories((c) => c.map((x) => (x._id === id ? { ...x, name } : x)));
      notifyToast('Category updated');
    } catch (err) {
      notifyToast('Update failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-gray-600">Manage marketplace categories</p>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Name</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={2} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={2} className="p-8 text-center text-gray-500">No categories</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="px-4 py-4">{cat.name}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleEdit(cat._id, cat.name)}>Edit</Button>
                        <Button variant="ghost" confirmText="Delete this category?" onClick={() => handleDelete(cat._id)}>Delete</Button>
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

export default CategoriesPage;
