import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import StatisticCard from '../components/StatisticCard';
import api from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({ users: '--', products: '--', orders: '--' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/admin/stats')
      .then((res) => {
        if (mounted && res.data?.success) setStats(res.data.data || {});
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Overview of platform metrics</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatisticCard title="Users" value={loading ? '—' : stats.users} />
            <StatisticCard title="Products" value={loading ? '—' : stats.products} />
            <StatisticCard title="Orders" value={loading ? '—' : stats.orders} />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;
