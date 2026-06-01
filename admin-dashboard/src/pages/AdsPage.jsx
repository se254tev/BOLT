import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ads');
      setAds(res.data?.ads || res.data || []);
    } catch (err) {
      notifyToast('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleDelete = async (id) => {
    const prev = ads.slice();
    setAds((a) => a.filter((x) => x._id !== id));
    try {
      await api.post(`/admin/ads/delete/${id}`);
      notifyToast('Ad removed');
    } catch (err) {
      setAds(prev);
      notifyToast('Remove failed');
      throw err;
    }
  };

  const handleEdit = async (id, currentTitle) => {
    const title = window.prompt('Edit ad title', currentTitle);
    if (!title) return;
    try {
      await api.post(`/admin/ads/update/${id}`, { title });
      setAds((a) => a.map((x) => (x._id === id ? { ...x, title } : x)));
      notifyToast('Ad updated');
    } catch (err) {
      notifyToast('Update failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Advertisements</h1>
          <p className="text-sm text-gray-600">Manage promotional banners and placements.</p>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Slot</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={2} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : ads.length === 0 ? (
                  <tr><td colSpan={2} className="p-8 text-center text-gray-500">No ads</td></tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad._id}>
                      <td className="px-4 py-4">{ad.slot || ad.title}</td>
                      <td className="px-4 py-4 space-x-2">
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleEdit(ad._id, ad.title)}>Edit</Button>
                        <Button variant="ghost" confirmText="Delete this ad?" onClick={() => handleDelete(ad._id)}>Delete</Button>
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

export default AdsPage;
