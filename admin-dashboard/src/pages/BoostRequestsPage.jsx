import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const BoostRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/properties/boost-requests');
      setRequests(res.data?.requests || []);
    } catch (err) {
      notifyToast('Failed to load boost requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api[action === 'approve' ? 'post' : 'patch'](`/admin/properties/${action}-boost/${id}`);
      notifyToast(`Boost ${action}d`);
      fetchRequests();
    } catch (err) {
      notifyToast(`Failed to ${action} boost`);
    }
  };

  const handleView = (item) => {
    window.alert(JSON.stringify(item, null, 2));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Boost Requests</h1>
          <p className="text-sm text-gray-600">Review property boost applications and approve or reject paid promotions.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Property</th>
                  <th className="px-4 py-3 text-gray-500">Owner</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Requested</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No boost requests found</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-4 py-4">{request.title || request.name || request.address || '—'}</td>
                      <td className="px-4 py-4">{request.ownerId || request.userId || '—'}</td>
                      <td className="px-4 py-4">{request.boostStatus}</td>
                      <td className="px-4 py-4">{new Date(request.updatedAt || request.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button variant="primary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleAction(request._id, 'approve')}>
                          Approve
                        </Button>
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleAction(request._id, 'reject')}>
                          Reject
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(request)}>
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

export default BoostRequestsPage;
