import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/agents/subscriptions');
      setSubscriptions(res.data?.subscriptions || []);
    } catch (err) {
      notifyToast('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const handleUpgrade = async (agentId) => {
    const planType = window.prompt('Enter new plan type (e.g. pro, premium)');
    if (!planType) return;
    const durationDays = Number(window.prompt('Enter duration in days', '365')) || 365;
    try {
      await api.patch('/admin/agents/upgrade-plan', { agentId, planType, durationDays });
      notifyToast('Subscription upgraded');
      fetchSubscriptions();
    } catch (err) {
      notifyToast('Failed to upgrade subscription');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Agent Subscriptions</h1>
          <p className="text-sm text-gray-600">Review active agent plans and issue upgrades where needed.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Agent</th>
                  <th className="px-4 py-3 text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-gray-500">Max Listings</th>
                  <th className="px-4 py-3 text-gray-500">Expires</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No subscriptions found</td></tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub._id || sub.agentId?._id || `${sub.agentId}-${sub.planType}`}>
                      <td className="px-4 py-4">{sub.agentId?.name || sub.agentId?.email || sub.agentId || '—'}</td>
                      <td className="px-4 py-4">{sub.planType}</td>
                      <td className="px-4 py-4">{sub.maxListings ?? '—'}</td>
                      <td className="px-4 py-4">{sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-4">
                        <Button variant="primary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleUpgrade(sub.agentId?._id || sub.agentId)}>
                          Upgrade
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

export default SubscriptionsPage;
