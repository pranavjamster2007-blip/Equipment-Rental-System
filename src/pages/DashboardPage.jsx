/**
 * DashboardPage.jsx
 * Summary dashboard and analytics report based on project records
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  Package,
  CalendarCheck,
  Truck,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // If Customer, we fetch their own bookings and equipment
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling Equipment Rental System reports..." />;
  }

  const stats = data?.stats || {
    totalEquipment: 0,
    availableCount: 0,
    rentedCount: 0,
    bookedCount: 0,
    maintenanceCount: 0,
    totalCustomers: 0,
    activeRentals: 0,
    pendingBookings: 0,
    financials: {
      rentalRevenue: 0,
      depositsCollected: 0,
      damageFeesCollected: 0,
      refundsProcessed: 0,
      netRevenue: 0,
    },
  };

  const isCustomer = user?.role === 'Customer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome & Role Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-blue-100">
                {user?.role} Portal
              </span>
              <span className="text-xs text-blue-200">2nd Year Project #20</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl">
              {isCustomer
                ? 'Browse available equipment, place reservations, track active rentals, and check deposit payment receipts.'
                : 'Central operations console for equipment inventory, pickup & return inspections, deposits, and financial reporting.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/equipment"
              className="px-4 py-2 bg-white text-blue-800 text-xs font-bold rounded-lg hover:bg-blue-50 transition shadow-xs flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Browse Equipment</span>
            </Link>
            {!isCustomer && (
              <Link
                to="/rentals"
                className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 text-white text-xs font-semibold rounded-lg border border-white/20 transition flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                <span>Process Pickup / Return</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError('')} />

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Equipment */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Equipment</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</div>
          <div className="mt-2 flex items-center text-xs text-gray-500 gap-2">
            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.availableCount} Available
            </span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{stats.rentedCount} Rented</span>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Rentals</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeRentals}</div>
          <p className="mt-2 text-xs text-gray-500">Currently in customer possession</p>
        </div>

        {/* Pending / Confirmed Bookings */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Bookings</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
          <p className="mt-2 text-xs text-gray-500">Reservations awaiting dispatch</p>
        </div>

        {/* Net Rental Revenue */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{stats.financials.rentalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ₹{stats.financials.depositsCollected.toLocaleString('en-IN')} Deposits Held
          </p>
        </div>
      </div>

      {/* Financials & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Inventory Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Equipment Status Distribution</span>
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">Available for Rent</span>
                <span className="text-gray-900 font-bold">{stats.availableCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(stats.availableCount / (stats.totalEquipment || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">Currently Rented Out</span>
                <span className="text-gray-900 font-bold">{stats.rentedCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(stats.rentedCount / (stats.totalEquipment || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">Reserved / Booked</span>
                <span className="text-gray-900 font-bold">{stats.bookedCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${(stats.bookedCount / (stats.totalEquipment || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">Under Maintenance / Repair</span>
                <span className="text-gray-900 font-bold">{stats.maintenanceCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.maintenanceCount / (stats.totalEquipment || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Report Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Financials & Deposits Ledger</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Rental Fee Earnings</span>
              <span className="font-semibold text-gray-900">
                ₹{stats.financials.rentalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Security Deposits Collected</span>
              <span className="font-semibold text-blue-600">
                ₹{stats.financials.depositsCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Damage Penalties Assessed</span>
              <span className="font-semibold text-red-600">
                ₹{stats.financials.damageFeesCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Security Deposits Refunded</span>
              <span className="font-semibold text-gray-500">
                ₹{stats.financials.refundsProcessed.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 font-bold text-sm text-gray-900">
              <span>Total System Revenue</span>
              <span className="text-emerald-700">
                ₹{stats.financials.netRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Category Inventory</span>
          </h2>
          <div className="space-y-2.5">
            {data?.categoryStats?.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">{cat.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {cat.count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Recent Equipment Bookings</span>
            </h2>
            <Link to="/bookings" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentBookings?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No bookings recorded yet</p>
            ) : (
              data?.recentBookings?.map((bk) => (
                <div key={bk._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-gray-900">{bk.equipmentName}</div>
                    <div className="text-gray-500 text-[11px]">
                      {bk.customerName} • {bk.startDate} to {bk.endDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bk.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bk.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {bk.status}
                    </span>
                    <div className="text-[11px] font-medium text-gray-700 mt-1">₹{bk.totalAmount}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Rentals */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Active & Recent Rentals</span>
            </h2>
            <Link to="/rentals" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recentRentals?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No rentals recorded yet</p>
            ) : (
              data?.recentRentals?.map((rn) => (
                <div key={rn._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-gray-900">{rn.equipmentName}</div>
                    <div className="text-gray-500 text-[11px]">
                      {rn.rentalNumber} • {rn.customerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rn.status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rn.status}
                    </span>
                    <div className="text-[11px] text-gray-500 mt-1">Return: {rn.expectedReturnDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
