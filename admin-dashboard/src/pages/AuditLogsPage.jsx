import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = filter === 'all' ? {} : { type: filter };
      const res = await api.get('/admin/audit-logs', { params });
      setLogs(res.data?.logs || []);
    } catch (err) {
      notifyToast('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [filter]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-gray-600">Review platform audit events for compliance and incident response.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All logs</option>
              <option value="user">User actions</option>
              <option value="auth">Authentication</option>
              <option value="service">Service events</option>
              <option value="admin">Admin actions</option>
            </select>
            <button onClick={fetchLogs} className="rounded-md bg-slate-900 px-4 py-2 text-white">Refresh</button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Timestamp</th>
                  <th className="px-4 py-3 text-gray-500">Type</th>
                  <th className="px-4 py-3 text-gray-500">Actor</th>
                  <th className="px-4 py-3 text-gray-500">Action</th>
                  <th className="px-4 py-3 text-gray-500">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No audit logs available</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id || `${log.timestamp}-${log.type}-${log.actor}`}> 
                      <td className="px-4 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-4">{log.type}</td>
                      <td className="px-4 py-4">{log.actor || 'system'}</td>
                      <td className="px-4 py-4">{log.action}</td>
                      <td className="px-4 py-4">{JSON.stringify(log.metadata || {}, null, 2).slice(0, 80)}</td>
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

export default AuditLogsPage;
