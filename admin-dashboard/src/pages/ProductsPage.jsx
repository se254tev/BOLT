import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data?.products || []);
    } catch (err) {
      notifyToast('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleModerate = async (id, action) => {
    const prev = products.slice();
    setProducts((p) => p.map((it) => (it._id === id ? { ...it, status: action === 'approve' ? 'approved' : 'rejected' } : it)));
    try {
      await api.patch(`/admin/products/${action}/${id}`);
      notifyToast(`Product ${action}d`);
    } catch (err) {
      setProducts(prev);
      notifyToast('Action failed');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    const prev = products.slice();
    setProducts((p) => p.filter((it) => it._id !== id));
    try {
      await api.delete(`/admin/products/${id}`);
      notifyToast('Product deleted');
    } catch (err) {
      setProducts(prev);
      notifyToast('Delete failed');
      throw err;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Product Moderation</h1>
            <p className="text-sm text-gray-600">Approve, reject, or delete marketplace product listings.</p>
          </div>
          <Button variant="primary" onClick={fetchProducts}>Refresh</Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Product</th>
                  <th className="px-4 py-3 text-gray-500">Seller</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No products found</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-4">{product.title || product.name || 'Untitled'}</td>
                      <td className="px-4 py-4">{product.sellerEmail || product.seller?.email || '—'}</td>
                      <td className="px-4 py-4">{product.status || (product.suspended ? 'suspended' : 'active')}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button className="rounded-full px-3 py-1 text-xs" variant="secondary" onClick={() => handleModerate(product._id, 'approve')} successMessage="Approved">Approve</Button>
                        <Button className="rounded-full px-3 py-1 text-xs" variant="ghost" onClick={() => handleModerate(product._id, 'reject')} errorMessage="Reject failed">Reject</Button>
                        <Button className="rounded-full px-3 py-1 text-xs" variant="ghost" confirmText="Delete this product?" onClick={() => handleDelete(product._id)} successMessage="Deleted">Delete</Button>
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

export default ProductsPage;
