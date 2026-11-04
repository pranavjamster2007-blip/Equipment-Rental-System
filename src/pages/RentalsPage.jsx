/**
 * RentalsPage.jsx
 * Active and Completed Rentals: Pickup handover and Return checkout with damage notes & deposit refunds
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  Truck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  ShieldAlert,
  X,
  FileCheck,
  Plus,
} from 'lucide-react';

export default function RentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Return Checkout Modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [returnData, setReturnData] = useState({
    actualReturnDate: '',
    conditionRating: 'Good',
    damageNotes: '',
    repairCostEstimate: 0,
    refundDeposit: true,
    remarks: '',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      let query = '';
      if (statusFilter !== 'All') query = `?status=${statusFilter}`;
      const res = await api.getRentals(query);
      if (res.success) {
        setRentals(res.rentals);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch rentals' });
    } finally {
      setLoading(false);
    }
  };

  const openReturnModal = (rental) => {
    setSelectedRental(rental);
    const today = new Date().toISOString().split('T')[0];
    setReturnData({
      actualReturnDate: today,
      conditionRating: 'Good',
      damageNotes: '',
      repairCostEstimate: 0,
      refundDeposit: true,
      remarks: 'Returned in good condition, inspected by counter staff.',
    });
    setIsReturnModalOpen(false);
    setTimeout(() => setIsReturnModalOpen(true), 10);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      const res = await api.processReturn(selectedRental._id, returnData);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Rental ${selectedRental.rentalNumber} returned successfully! Inspection & deposit records updated.`,
        });
        setIsReturnModalOpen(false);
        fetchRentals();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to process equipment return.' });
    }
  };

  const filteredRentals = rentals.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.rentalNumber?.toLowerCase().includes(q) ||
      r.equipmentName?.toLowerCase().includes(q) ||
      r.customerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            <span>{user?.role === 'Customer' ? 'My Active Rentals' : 'Rentals & Return Management'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track equipment pickup dispatch, overdue tracking, return inspections, and security deposit refunds
          </p>
        </div>
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by rental #, equipment, or customer name..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (Currently Checked Out)</option>
              <option value="Returned">Returned (Checked In)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading rentals..." />
      ) : filteredRentals.length === 0 ? (
        <EmptyState
          title="No rentals found"
          description="There are currently no active or returned equipment records."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rental #</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Handover Staff</th>
                  <th className="py-3 px-4">Pickup Date</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4">Deposit Held</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRentals.map((r) => {
                  const isActive = r.status === 'Active';
                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{r.rentalNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{r.equipmentName}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{r.customerName}</td>
                      <td className="py-3 px-4 text-gray-600">{r.staffName || 'Counter Staff'}</td>
                      <td className="py-3 px-4">{r.pickupDate}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {r.expectedReturnDate}
                        {r.actualReturnDate && (
                          <div className="text-[10px] text-emerald-600">Returned: {r.actualReturnDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-700">₹{r.initialDepositPaid}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && isActive ? (
                          <button
                            onClick={() => openReturnModal(r)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Process Return</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURN CHECKOUT MODAL */}
      {isReturnModalOpen && selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span>Process Return & Checkout Inspection</span>
              </h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-xs space-y-1">
              <div className="font-bold text-gray-900">{selectedRental.equipmentName}</div>
              <div className="text-gray-600">Rental Ref: {selectedRental.rentalNumber}</div>
              <div className="text-gray-600">Customer: {selectedRental.customerName}</div>
              <div className="text-blue-700 font-semibold">Security Deposit Held: ₹{selectedRental.initialDepositPaid}</div>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Actual Return Date *</label>
                <input
                  type="date"
                  required
                  value={returnData.actualReturnDate}
                  onChange={(e) => setReturnData({ ...returnData, actualReturnDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Inspection Return Condition Rating</label>
                <select
                  value={returnData.conditionRating}
                  onChange={(e) => setReturnData({ ...returnData, conditionRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Excellent">Excellent - Mint, spotless</option>
                  <option value="Good">Good - Normal minor usage wear</option>
                  <option value="Fair">Fair - Heavy usage signs</option>
                  <option value="Damaged">Damaged - Physical/functional defect noted</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Damage Notes & Condition Assessment
                </label>
                <textarea
                  rows={2}
                  value={returnData.damageNotes}
                  onChange={(e) => setReturnData({ ...returnData, damageNotes: e.target.value })}
                  placeholder="Record any scratches, cracked glass, missing accessories, or mechanical issues..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {returnData.conditionRating === 'Damaged' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Damage Fee Assessment</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-red-900 mb-1">
                      Estimated Repair / Penalty Cost (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={returnData.repairCostEstimate}
                      onChange={(e) =>
                        setReturnData({ ...returnData, repairCostEstimate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-red-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Deposit Refund Calculation */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900">Process Deposit Refund:</span>
                  <input
                    type="checkbox"
                    checked={returnData.refundDeposit}
                    onChange={(e) => setReturnData({ ...returnData, refundDeposit: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </div>
                {returnData.refundDeposit && (
                  <div className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200 flex justify-between">
                    <span>Net Refund Amount to Customer:</span>
                    <span className="font-bold">
                      ₹{Math.max(0, selectedRental.initialDepositPaid - (returnData.repairCostEstimate || 0))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  value={returnData.remarks}
                  onChange={(e) => setReturnData({ ...returnData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Complete Return & Log Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
