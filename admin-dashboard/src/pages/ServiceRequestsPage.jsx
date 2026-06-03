import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const ServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { status, type, search };
      const res = await api.get('/admin/service-requests', { params });
      setRequests(res.data?.requests || []);
    } catch (err) {
      notifyToast('Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [status, type, search]);

  const handleView = async (id) => {
    try {
      const res = await api.get(`/admin/service-requests/${id}`);
      window.alert(JSON.stringify(res.data?.request || {}, null, 2));
    } catch (err) {
      notifyToast('Failed to load request details');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Service Requests</h1>
          <p className="text-sm text-gray-600">View platform service requests and inspect request states without polling.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All types</option>
                <option value="RIDE_REQUEST">Ride</option>
                <option value="ERRAND_REQUEST">Errand</option>
                <option value="MARKETPLACE_ORDER">Marketplace order</option>
              </select>
              <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="BIDDING">Bidding</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
              <input
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm md:w-80"
                placeholder="Search by request id or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={fetchRequests} successMessage="Requests refreshed">
              Refresh
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Request ID</th>
                  <th className="px-4 py-3 text-gray-500">Type</th>
                  <th className="px-4 py-3 text-gray-500">State</th>
                  <th className="px-4 py-3 text-gray-500">User</th>
                  <th className="px-4 py-3 text-gray-500">Created</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No service requests</td></tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-4 py-4">{request._id}</td>
                      <td className="px-4 py-4">{request.requestType}</td>
                      <td className="px-4 py-4">{request.requestState}</td>
                      <td className="px-4 py-4">{request.userId?.name || request.userId?.email || '—'}</td>
                      <td className="px-4 py-4">{new Date(request.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(request._id)}>
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

export default ServiceRequestsPage;
