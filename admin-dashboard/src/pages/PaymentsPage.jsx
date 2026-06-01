import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Awaiting payment', value: 'AWAITING_PAYMENT' },
  { label: 'Awaiting seller confirmation', value: 'AWAITING_SELLER_CONFIRMATION' },
  { label: 'Rejected', value: 'PAYMENT_REJECTED' },
  { label: 'Paid', value: 'PAID' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/payments', {
        params: { status, search, page, limit },
      });
      setPayments(res.data?.payments || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      notifyToast('Failed to load payment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [status, search, page]);

  const refresh = async () => {
    setPage(1);
    await fetchPayments();
  };

  const handleApprove = async (id) => {
    const reference = window.prompt('Enter approved payment reference');
    if (!reference) return;
    try {
      await api.post(`/admin/payments/${id}/approve`, { approvedPaymentReference: reference, reason: 'Approved by admin' });
      notifyToast('Payment approved');
      setPayments((prev) => prev.map((item) => (item.orderId === id ? { ...item, status: 'PAID' } : item)));
    } catch (err) {
      notifyToast('Failed to approve payment');
      throw err;
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;
    try {
      await api.post(`/admin/payments/${id}/reject`, { rejectionReason: reason });
      notifyToast('Payment rejected');
      setPayments((prev) => prev.map((item) => (item.orderId === id ? { ...item, status: 'PAYMENT_REJECTED' } : item)));
    } catch (err) {
      notifyToast('Failed to reject payment');
      throw err;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Payment Verifications</h1>
          <p className="text-sm text-gray-600">Review seller payment submissions, approve or reject them, and inspect screenshot proof.</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <select
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search by order, buyer, seller, or transaction"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm md:w-80"
              />
            </div>
            <Button variant="primary" onClick={refresh} successMessage="Refreshed payment records">
              Refresh
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-gray-500">Order</th>
                  <th className="px-4 py-3 text-gray-500">Type</th>
                  <th className="px-4 py-3 text-gray-500">Buyer</th>
                  <th className="px-4 py-3 text-gray-500">Seller</th>
                  <th className="px-4 py-3 text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-gray-500">Submitted</th>
                  <th className="px-4 py-3 text-gray-500">Status</th>
                  <th className="px-4 py-3 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.orderId}>
                      <td className="px-4 py-4">{payment.orderId}</td>
                      <td className="px-4 py-4">{payment.type}</td>
                      <td className="px-4 py-4">{payment.buyer}</td>
                      <td className="px-4 py-4">{payment.seller}</td>
                      <td className="px-4 py-4">{payment.amount.toFixed(2)}</td>
                      <td className="px-4 py-4">{formatDate(payment.submittedAt)}</td>
                      <td className="px-4 py-4">{payment.status}</td>
                      <td className="px-4 py-4 space-x-1">
                        {payment.screenshotUrl ? (
                          <Button
                            variant="secondary"
                            className="rounded-full px-3 py-1 text-xs"
                            onClick={() => window.open(payment.screenshotUrl, '_blank')}
                          >
                            View
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          className="rounded-full px-3 py-1 text-xs"
                          onClick={() => handleApprove(payment.orderId)}
                          disabled={payment.status === 'PAID'}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="rounded-full px-3 py-1 text-xs"
                          onClick={() => handleReject(payment.orderId)}
                          disabled={payment.status === 'PAYMENT_REJECTED'}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>{`Showing ${payments.length} of ${total} records`}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page * limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentsPage;
