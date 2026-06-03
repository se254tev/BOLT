import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import StatisticCard from '../components/StatisticCard';
import api from '../services/api';
import { subscribeToAdminEvents, disconnectAdminSocket } from '../services/socketService';

const eventLabels = {
  request_created: 'New request created',
  worker_registered: 'New worker registered',
  bid_submitted: 'New bid submitted',
  request_assigned: 'Request assigned',
  request_completed: 'Request completed',
};

const DashboardPage = () => {
  const [stats, setStats] = useState({ users: '--', products: '--', orders: '--' });
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.get('/admin/stats')
      .then((res) => {
        if (mounted) setStats(res.data?.stats || res.data?.data?.stats || {});
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));

    subscribeToAdminEvents((event) => {
      const label = eventLabels[event.type] || event.type;
      setEvents((currentEvents) => [{ id: Date.now(), label, payload: event.payload }, ...currentEvents].slice(0, 6));
      setEventCount((count) => count + 1);
    });

    return () => {
      mounted = false;
      disconnectAdminSocket();
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Overview of platform metrics with live service events.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatisticCard title="Users" value={loading ? '—' : stats.users} />
              <StatisticCard title="Products" value={loading ? '—' : stats.products} />
              <StatisticCard title="Orders" value={loading ? '—' : stats.orders} />
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Live admin events</h2>
                  <p className="text-sm text-gray-500">Incoming service events visible in real time.</p>
                </div>
                <div className="rounded-full bg-black px-3 py-1 text-sm text-white">{eventCount} events</div>
              </div>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Waiting for admin events...
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="text-sm font-medium text-gray-900">{event.label}</div>
                      <div className="mt-2 text-xs text-gray-500">{JSON.stringify(event.payload || {}, null, 2).slice(0, 120)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
