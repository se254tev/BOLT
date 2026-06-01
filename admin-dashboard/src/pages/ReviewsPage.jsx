import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      setReviews(res.data?.reviews || res.data || []);
    } catch (err) {
      notifyToast('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const remove = async (id) => {
    const prev = reviews.slice();
    setReviews((r) => r.filter((x) => x._id !== id));
    try {
      await api.delete(`/admin/reviews/${id}`);
      notifyToast('Review deleted');
    } catch (err) {
      setReviews(prev);
      notifyToast('Delete failed');
      throw err;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Review Moderation</h1>
          <p className="text-sm text-gray-600">Delete inappropriate reviews and protect buyer trust.</p>
        </div>
        <Card>
          <div className="space-y-4">
            {loading ? <div className="p-8 text-center text-gray-500">Loading…</div> : reviews.length === 0 ? <div className="p-8 text-center text-gray-500">No reviews</div> : reviews.map((rev) => (
              <div key={rev._id} className="rounded-lg p-4 bg-white border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">{rev.content || rev.comment}</p>
                    <p className="mt-1 text-sm text-gray-600">by {rev.userEmail || rev.user?.email} on {rev.productTitle || rev.product?.title}</p>
                  </div>
                  <Button variant="ghost" confirmText="Delete this review?" onClick={() => remove(rev._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ReviewsPage;
