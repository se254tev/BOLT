import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/service-workers');
      setWorkers(res.data?.workers || []);
    } catch (err) {
      notifyToast('Failed to load service workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const handleStatus = async (id) => {
    const status = window.prompt('Enter availability status (AVAILABLE, UNAVAILABLE, BUSY)');
    if (!status) return;
    try {
      await api.patch(`/admin/service-workers/${id}/status`, { status });
      notifyToast('Worker status updated');
      fetchWorkers();
    } catch (err) {
      notifyToast('Failed to update status');
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.post(`/admin/service-workers/${id}/approve`);
      notifyToast('Worker approved');
      fetchWorkers();
    } catch (err) {
      notifyToast('Failed to approve worker');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/service-workers/${id}/reject`);
      notifyToast('Worker rejected');
      fetchWorkers();
    } catch (err) {
      notifyToast('Failed to reject worker');
    }
  };

  const handleView = (worker) => {
    window.alert(JSON.stringify(worker, null, 2));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Service Workers</h1>
          <p className="text-sm text-gray-600">Review worker profiles, inspect documents, and manage verification status.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Worker</th>
                  <th className="px-4 py-3 text-gray-500">Role</th>
                  <th className="px-4 py-3 text-gray-500">Type</th>
                  <th className="px-4 py-3 text-gray-500">Verified</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : workers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No workers found</td></tr>
                ) : (
                  workers.map((worker) => (
                    <tr key={worker._id}>
                      <td className="px-4 py-4">{worker.userId?.name || worker.userId?.email || worker._id}</td>
                      <td className="px-4 py-4">{worker.role}</td>
                      <td className="px-4 py-4">{worker.serviceType}</td>
                      <td className="px-4 py-4">{worker.isVerified ? 'Yes' : worker.verificationStatus || 'pending'}</td>
                      <td className="px-4 py-4">{worker.availabilityStatus}</td>
                      <td className="px-4 py-4 space-x-2">
                        {!worker.isVerified && (
                          <Button variant="primary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleVerify(worker._id)}>
                            Approve
                          </Button>
                        )}
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleReject(worker._id)}>
                          Reject
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleStatus(worker._id)}>
                          Change Status
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(worker)}>
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

export default WorkersPage;
