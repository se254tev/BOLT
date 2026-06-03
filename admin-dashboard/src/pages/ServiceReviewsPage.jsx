import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const ServiceReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/service-reviews');
      setReviews(res.data?.reviews || []);
    } catch (err) {
      notifyToast('Failed to load service reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleFlag = async (id) => {
    try {
      await api.patch(`/admin/service-reviews/${id}/flag`);
      notifyToast('Review flagged for moderation');
      fetchReviews();
    } catch (err) {
      notifyToast('Failed to flag review');
    }
  };

  const handleView = (review) => {
    window.alert(JSON.stringify(review, null, 2));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Service Reviews</h1>
          <p className="text-sm text-gray-600">Monitor service feedback and flag reviews that violate policy.</p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Reviewer</th>
                  <th className="px-4 py-3 text-gray-500">Worker</th>
                  <th className="px-4 py-3 text-gray-500">Rating</th>
                  <th className="px-4 py-3 text-gray-500">Comment</th>
                  <th className="px-4 py-3 text-gray-500">Flagged</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading…</td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No reviews found</td></tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review._id}>
                      <td className="px-4 py-4">{review.userId?.name || review.userId?.email || '—'}</td>
                      <td className="px-4 py-4">{review.workerId || review.serviceId || '—'}</td>
                      <td className="px-4 py-4">{review.rating}</td>
                      <td className="px-4 py-4">{review.comment?.slice(0, 60) || '—'}</td>
                      <td className="px-4 py-4">{review.flagged ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-4">
                        <Button variant="secondary" className="rounded-full px-3 py-1 text-xs" onClick={() => handleFlag(review._id)}>
                          Flag
                        </Button>
                        <Button variant="ghost" className="rounded-full px-3 py-1 text-xs" onClick={() => handleView(review)}>
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

export default ServiceReviewsPage;
