import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const BidsPage = () => {
  const [bids, setBids] = useState([]);
  const [requestId, setRequestId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const params = {};
      if (requestId) params.requestId = requestId;
      if (status) params.status = status;
      const res = await api.get('/admin/service-bids', { params });
      setBids(res.data?.bids || []);
    } catch (err) {
      notifyToast('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBids(); }, [requestId, status]);

  const handleView = (bid) => {
    window.alert(JSON.stringify(bid, null, 2));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Service Bids</h1>
          <p className="text-sm text-gray-600">Inspect submitted bids and search by request or bid status.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm md:w-72"
                placeholder="Request ID"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
              />
              <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <Button variant="primary" onClick={fetchBids} successMessage="Bids refreshed">
              Refresh
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Bid ID</th>
                  <th className="px-4 py-3 text-gray-500">Request</th>
                  <th className="px-4 py-3 text-gray-500">Worker</th>
                  <th className="px-4 py-3 text-gray-500">Price</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : bids.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No bids found</td></tr>
                ) : (
                  bids.map((bid) => (
                    <tr key={bid._id}>
                      <td className="px-4 py-4">{bid._id}</td>
                      <td className="px-4 py-4">{bid.requestId}</td>
                      <td className="px-4 py-4">{bid.workerId || bid.userId || '—'}</td>
                      <td className="px-4 py-4">{bid.price}</td>
                      <td className="px-4 py-4">{bid.status}</td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(bid)}>
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

export default BidsPage;
