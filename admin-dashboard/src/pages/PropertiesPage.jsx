import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties');
      setProperties(res.data?.properties || []);
    } catch (err) {
      notifyToast('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const moderate = async (id, action) => {
    const prev = properties.slice();
    setProperties((p) => p.map((it) => (it._id === id ? { ...it, boostStatus: action === 'approve' ? 'approved' : 'rejected' } : it)));
    try {
      if (action === 'approve') await api.post(`/admin/properties/approve-boost/${id}`);
      else await api.patch(`/admin/properties/reject-boost/${id}`);
      notifyToast(`Property ${action}d`);
    } catch (err) {
      setProperties(prev);
      notifyToast('Action failed');
      throw err;
    }
  };

  const remove = async (id) => {
    const prev = properties.slice();
    setProperties((p) => p.filter((it) => it._id !== id));
    try {
      await api.delete(`/admin/properties/${id}`);
      notifyToast('Property removed');
    } catch (err) {
      setProperties(prev);
      notifyToast('Remove failed');
      throw err;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Property Moderation</h1>
          <p className="text-sm text-gray-600">Review property listings to approve, reject, or remove listings.</p>
        </div>
        <Card>
          <div className="space-y-4">
            {loading ? <div className="p-8 text-center text-gray-500">Loading…</div> : properties.length === 0 ? <div className="p-8 text-center text-gray-500">No properties</div> : properties.map((prop) => (
              <div key={prop._id} className="rounded-lg p-4 bg-white border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{prop.title || prop.name}</h2>
                    <p className="text-sm text-gray-600">{prop.sellerEmail || prop.seller?.email}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{prop.boostStatus || 'pending'}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" onClick={() => moderate(prop._id, 'approve')}>Approve</Button>
                  <Button variant="ghost" onClick={() => moderate(prop._id, 'reject')}>Reject</Button>
                  <Button variant="ghost" confirmText="Delete this property?" onClick={() => remove(prop._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PropertiesPage;
