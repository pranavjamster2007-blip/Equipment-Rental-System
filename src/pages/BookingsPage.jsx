/**
 * BookingsPage.jsx
 * Bookings reservation management screen with status tracking and pickup dispatch
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  Trash2,
  X,
} from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pickup Handover Modal State
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupData, setPickupData] = useState({
    expectedReturnDate: '',
    initialDepositPaid: '',
    conditionRating: 'Excellent',
    damageNotes: 'Clean handover condition, no damage noted.',
    remarks: '',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = '';
      if (statusFilter !== 'All') query = `?status=${statusFilter}`;
      const res = await api.getBookings(query);
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch bookings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.updateBookingStatus(id, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', message: `Booking marked as ${newStatus}` });
        fetchBookings();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update booking status' });
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      const res = await api.deleteBooking(id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Booking removed.' });
        fetchBookings();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete booking' });
    }
  };

  const openPickupModal = (booking) => {
    setSelectedBooking(booking);
    setPickupData({
      expectedReturnDate: booking.endDate,
      initialDepositPaid: booking.depositAmount,
      conditionRating: 'Excellent',
      damageNotes: 'No pre-existing damages noted during handover inspection.',
      remarks: 'Handed over equipment to student after identity check.',
    });
    setIsPickupModalOpen(true);
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      const payload = {
        bookingId: selectedBooking._id,
        customerId: selectedBooking.customerId,
        customerName: selectedBooking.customerName,
        equipmentId: selectedBooking.equipmentId,
        expectedReturnDate: pickupData.expectedReturnDate,
        initialDepositPaid: pickupData.initialDepositPaid,
        conditionRating: pickupData.conditionRating,
        damageNotes: pickupData.damageNotes,
        remarks: pickupData.remarks,
      };

      const res = await api.processPickup(payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Equipment picked up successfully! Active rental created: ${res.rental?.rentalNumber}`,
        });
        setIsPickupModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to process pickup dispatch.' });
    }
  };

  // Filter in memory for search
  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.equipmentName?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>{user?.role === 'Customer' ? 'My Equipment Bookings' : 'Bookings Management'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track reservation approvals, dates, calculated rental amounts, and pickup status
          </p>
        </div>
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Search and Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by booking #, equipment, or customer name..."
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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading bookings..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="There are currently no equipment reservations matching your filters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Booking #</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Rental Fee</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => {
                  const statusStyles = {
                    Pending: 'bg-amber-100 text-amber-800',
                    Confirmed: 'bg-emerald-100 text-emerald-800',
                    Completed: 'bg-blue-100 text-blue-800',
                    Cancelled: 'bg-red-100 text-red-800',
                  };

                  return (
                    <tr key={b._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{b.bookingNumber}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{b.equipmentName}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{b.customerName}</div>
                        <div className="text-[10px] text-gray-400">{b.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-medium">
                          {b.startDate} to {b.endDate}
                        </div>
                        <div className="text-[10px] text-gray-500">{b.totalDays} day(s)</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">₹{b.totalAmount}</td>
                      <td className="py-3 px-4 font-medium text-blue-700">₹{b.depositAmount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyles[b.status] || 'bg-gray-100'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Staff / Admin Actions */}
                          {canManage && b.status === 'Confirmed' && (
                            <button
                              onClick={() => openPickupModal(b)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
                              title="Process Pickup Handover"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {canManage && b.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusUpdate(b._id, 'Confirmed')}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                              title="Confirm Booking"
                            >
                              Confirm
                            </button>
                          )}

                          {canManage && b.status !== 'Cancelled' && b.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusUpdate(b._id, 'Cancelled')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => handleDeleteBooking(b._id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PICKUP HANDOVER MODAL */}
      {isPickupModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Process Pickup Handover & Inspection</span>
              </h3>
              <button onClick={() => setIsPickupModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-xs space-y-1">
              <div className="font-bold text-gray-900">{selectedBooking.equipmentName}</div>
              <div className="text-gray-600">Customer: {selectedBooking.customerName}</div>
              <div className="text-gray-600">Booking Ref: {selectedBooking.bookingNumber}</div>
            </div>

            <form onSubmit={handlePickupSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={pickupData.expectedReturnDate}
                    onChange={(e) => setPickupData({ ...pickupData, expectedReturnDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial Deposit Collected (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={pickupData.initialDepositPaid}
                    onChange={(e) => setPickupData({ ...pickupData, initialDepositPaid: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Handover Condition Rating</label>
                <select
                  value={pickupData.conditionRating}
                  onChange={(e) => setPickupData({ ...pickupData, conditionRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Excellent">Excellent - Factory Condition</option>
                  <option value="Good">Good - Minor normal cosmetic marks</option>
                  <option value="Fair">Fair - Working with visible wear</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pickup Inspection & Accessories Notes</label>
                <textarea
                  rows={2}
                  value={pickupData.damageNotes}
                  onChange={(e) => setPickupData({ ...pickupData, damageNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Staff Remarks</label>
                <input
                  type="text"
                  value={pickupData.remarks}
                  onChange={(e) => setPickupData({ ...pickupData, remarks: e.target.value })}
                  placeholder="ID verified, battery and charger included"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Complete Pickup Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
