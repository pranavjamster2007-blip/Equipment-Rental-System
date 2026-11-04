/**
 * Navbar.jsx
 * Navigation bar with role-based routing and college project switcher
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Wrench,
  LayoutDashboard,
  Package,
  CalendarCheck,
  Truck,
  ClipboardCheck,
  CreditCard,
  Users,
  Layers,
  FileText,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, quickSwitchDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'Guest';

  // Role color styles
  const roleBadges = {
    Admin: 'bg-purple-100 text-purple-800 border-purple-200',
    Staff: 'bg-blue-100 text-blue-800 border-blue-200',
    Customer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* College Project Evaluation Quick-Switch Bar */}
      <div className="bg-gray-900 text-gray-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-gray-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400">Project 20: Equipment Rental System</span>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <span className="text-gray-400 hidden sm:inline">ReactJS • Node.js • MongoDB • JWT</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-300 font-medium">Demo Role Switch:</span>
          <button
            onClick={() => quickSwitchDemo('Admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              role === 'Admin' ? 'bg-purple-600 text-white shadow-xs' : 'bg-gray-800 hover:bg-gray-700 text-purple-300'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => quickSwitchDemo('Staff')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              role === 'Staff' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-800 hover:bg-gray-700 text-blue-300'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => quickSwitchDemo('Customer')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              role === 'Customer' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-800 hover:bg-gray-700 text-emerald-300'
            }`}
          >
            Customer
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 leading-tight">Equipment Rental</div>
              <div className="text-[11px] text-gray-500 font-medium">Internal Project Mark System</div>
            </div>
          </Link>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900">{user.name}</div>
                  <div className="text-[11px] text-gray-500">{user.email}</div>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${roleBadges[role] || 'bg-gray-100 text-gray-700'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{role}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        {user && (
          <nav className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-none text-xs font-medium border-t border-gray-100 pt-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                isActive('/') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/equipment"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                isActive('/equipment') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{role === 'Customer' ? 'Browse Equipment' : 'Equipment Inventory'}</span>
            </Link>

            {(role === 'Admin' || role === 'Staff') && (
              <Link
                to="/categories"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                  isActive('/categories') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Categories</span>
              </Link>
            )}

            <Link
              to="/bookings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                isActive('/bookings') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{role === 'Customer' ? 'My Bookings' : 'Bookings'}</span>
            </Link>

            <Link
              to="/rentals"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                isActive('/rentals') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{role === 'Customer' ? 'My Rentals' : 'Rentals & Returns'}</span>
            </Link>

            {(role === 'Admin' || role === 'Staff') && (
              <Link
                to="/inspections"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                  isActive('/inspections') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Inspections & Damage</span>
              </Link>
            )}

            <Link
              to="/payments"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                isActive('/payments') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{role === 'Customer' ? 'My Payments' : 'Payments & Deposits'}</span>
            </Link>

            {role === 'Admin' && (
              <Link
                to="/users"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ${
                  isActive('/users') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Management</span>
              </Link>
            )}

            <Link
              to="/project-docs"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition shrink-0 ml-auto ${
                isActive('/project-docs')
                  ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Submission Pack & ER Diagram</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
