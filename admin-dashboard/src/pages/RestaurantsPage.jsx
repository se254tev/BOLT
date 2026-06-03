import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'verified') params.verified = 'true';
      if (filter === 'unverified') params.verified = 'false';
      if (search) params.search = search;
      const res = await api.get('/admin/restaurants', { params });
      setRestaurants(res.data?.restaurants || []);
    } catch (err) {
      notifyToast('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filter, search]);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/admin/restaurants/${action}/${id}`);
      notifyToast(`Restaurant ${action}d`);
      fetchRestaurants();
    } catch (err) {
      notifyToast(`Failed to ${action} restaurant`);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/admin/restaurants/${id}`);
      const restaurant = res.data?.restaurant || {};
      window.alert(JSON.stringify(restaurant, null, 2));
    } catch (err) {
      notifyToast('Failed to load restaurant details');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Restaurants</h1>
          <p className="text-sm text-gray-600">Review restaurant profiles, verify ownership, or suspend listings.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm md:w-80"
                placeholder="Search restaurants"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All restaurants</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <Button variant="primary" onClick={fetchRestaurants} successMessage="Restaurant list refreshed">
              Refresh
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Name</th>
                  <th className="px-4 py-3 text-gray-500">Owner ID</th>
                  <th className="px-4 py-3 text-gray-500">Verified</th>
                  <th className="px-4 py-3 text-gray-500">Suspended</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No restaurants found
                    </td>
                  </tr>
                ) : (
                  restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td className="px-4 py-4">{restaurant.name || restaurant.title || '—'}</td>
                      <td className="px-4 py-4">{restaurant.ownerId || restaurant.userId || '—'}</td>
                      <td className="px-4 py-4">{restaurant.isVerified ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-4">{restaurant.suspended ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-4 space-x-2">
                        {!restaurant.isVerified && (
                          <Button
                            variant="primary"
                            className="rounded-full px-3 py-1 text-xs"
                            onClick={() => handleAction(restaurant._id, 'verify')}
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="rounded-full px-3 py-1 text-xs"
                          onClick={() => handleAction(restaurant._id, 'suspend')}
                        >
                          Suspend
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-full px-3 py-1 text-xs"
                          onClick={() => handleView(restaurant._id)}
                        >
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

export default RestaurantsPage;
