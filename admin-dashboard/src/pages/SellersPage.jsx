import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const SellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/sellers/pending');
      setSellers(res.data?.sellers || []);
    } catch (err) {
      notifyToast('Failed to load pending sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/seller/${id}/approve`);
      notifyToast('Seller approved');
      fetchSellers();
    } catch (err) {
      notifyToast('Failed to approve seller');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Why reject this seller application?');
    if (!reason) return;
    try {
      await api.patch(`/admin/seller/${id}/reject`, { rejectionReason: reason });
      notifyToast('Seller rejected');
      fetchSellers();
    } catch (err) {
      notifyToast('Failed to reject seller');
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/users/${id}`);
      const user = res.data?.user || {};
      window.alert(JSON.stringify(user, null, 2));
    } catch (err) {
      notifyToast('Failed to load seller profile');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Seller Approvals</h1>
          <p className="text-sm text-gray-600">Review pending seller applications, approve or reject them, and inspect submitted details.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Name</th>
                  <th className="px-4 py-3 text-gray-500">Email</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : sellers.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No pending sellers</td></tr>
                ) : (
                  sellers.map((seller) => (
                    <tr key={seller._id}>
                      <td className="px-4 py-4">{seller.name || seller.email}</td>
                      <td className="px-4 py-4">{seller.email}</td>
                      <td className="px-4 py-4">{seller.sellerStatus || 'pending'}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button variant="primary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleApprove(seller._id)}>
                          Approve
                        </Button>
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleReject(seller._id)}>
                          Reject
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(seller._id)}>
                          View
                        </Button>
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

export default SellersPage;
