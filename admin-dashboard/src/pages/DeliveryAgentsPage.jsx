import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const AGENT_STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'BUSY', 'offline'];

const DeliveryAgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/delivery-agents');
      setAgents(res.data?.agents || []);
    } catch (err) {
      notifyToast('Failed to load delivery agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleVerify = async (id) => {
    try {
      await api.patch(`/admin/delivery-agents/verify/${id}`);
      notifyToast('Delivery agent verified');
      fetchAgents();
    } catch (err) {
      notifyToast('Failed to verify agent');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await api.patch(`/admin/delivery-agents/suspend/${id}`);
      notifyToast('Delivery agent suspended');
      fetchAgents();
    } catch (err) {
      notifyToast('Failed to suspend agent');
    }
  };

  const handleStatus = async (id) => {
    const status = window.prompt('Enter status (AVAILABLE, UNAVAILABLE, BUSY, offline)');
    if (!status) return;
    try {
      await api.patch(`/admin/delivery-agents/status/${id}`, { status });
      notifyToast('Agent status updated');
      fetchAgents();
    } catch (err) {
      notifyToast('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Delivery Agents</h1>
          <p className="text-sm text-gray-600">Manage delivery agents, verify identity, update status, or suspend access.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Name</th>
                  <th className="px-4 py-3 text-gray-500">Email</th>
                  <th className="px-4 py-3 text-gray-500">Verified</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : agents.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No agents found</td></tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent._id}>
                      <td className="px-4 py-4">{agent.name || agent.email}</td>
                      <td className="px-4 py-4">{agent.email}</td>
                      <td className="px-4 py-4">{agent.isVerified ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-4">{agent.status || agent.availabilityStatus || '—'}</td>
                      <td className="px-4 py-4 space-x-2">
                        {!agent.isVerified && (
                          <Button variant="primary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleVerify(agent._id)}>
                            Verify
                          </Button>
                        )}
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleStatus(agent._id)}>
                          Change Status
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleSuspend(agent._id)}>
                          Suspend
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

export default DeliveryAgentsPage;
