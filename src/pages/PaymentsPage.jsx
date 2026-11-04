/**
 * PaymentsPage.jsx
 * Payments and security deposit transactions ledger
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  IndianRupee,
  Receipt,
  X,
  CheckCircle,
} from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'Rental Fee',
    paymentMethod: 'UPI',
    remarks: '',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    fetchPayments();
  }, [typeFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = '';
      if (typeFilter !== 'All') query = `?type=${typeFilter}`;
      const res = await api.getPayments(query);
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load payments' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setFeedback({ type: 'error', message: 'Please specify a valid payment amount.' });
      return;
    }

    try {
      const res = await api.createPayment(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Payment recorded successfully!' });
        setIsModalOpen(false);
        setFormData({ amount: '', paymentType: 'Rental Fee', paymentMethod: 'UPI', remarks: '' });
        fetchPayments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record payment' });
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.paymentNumber?.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>{user?.role === 'Customer' ? 'My Payments & Receipts' : 'Payments & Deposits Ledger'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Rental charges, refundable security deposits, damage penalty deductions, and refunds
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Transaction</span>
        </button>
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filter and Summary Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by payment #, txn id, or customer..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="All">All Payment Types</option>
              <option value="Deposit">Security Deposits</option>
              <option value="Rental Fee">Rental Fees</option>
              <option value="Damage Fee">Damage Penalties</option>
              <option value="Refund">Refunds</option>
            </select>
          </div>

          <div className="bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-100 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Filtered Total:</span>
            <span className="text-sm font-bold text-emerald-900">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching financial transactions..." />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          description="Transactions are created when paying rental advance, submitting security deposits, or refunding on return."
          actionText="Record Payment"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => {
                  const typeColors = {
                    'Rental Fee': 'bg-emerald-100 text-emerald-800',
                    Deposit: 'bg-blue-100 text-blue-800',
                    'Damage Fee': 'bg-red-100 text-red-800',
                    Refund: 'bg-gray-100 text-gray-800',
                  };

                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{p.paymentNumber}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{p.customerName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${typeColors[p.paymentType] || 'bg-gray-100'}`}>
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">{p.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">{p.transactionId}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 text-sm">₹{p.amount}</td>
                      <td className="py-3 px-4 text-gray-500">{p.paymentDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{p.remarks || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Record Payment Transaction</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="2500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Type</label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Rental Fee">Rental Fee</option>
                    <option value="Deposit">Security Deposit</option>
                    <option value="Damage Fee">Damage Penalty</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Advance rental fee received"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
