/**
 * UsersPage.jsx
 * Admin CRUD management for system users (Admin, Staff, Customer)
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  Users,
  Search,
  Filter,
  Plus,
  Shield,
  UserCheck,
  Edit,
  Trash2,
  X,
  Lock,
  Mail,
  User,
  Phone,
} from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = '';
      if (roleFilter !== 'All') query = `?role=${roleFilter}`;
      const res = await api.getUsers(query);
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Customer',
      phone: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone || '',
      address: u.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }

    try {
      if (editingUser) {
        const res = await api.updateUser(editingUser._id, formData);
        if (res.success) {
          setFeedback({ type: 'success', message: 'User updated successfully!' });
        }
      } else {
        if (!formData.password) {
          setFeedback({ type: 'error', message: 'Password is required when creating a new user.' });
          return;
        }
        const res = await api.createUser(formData);
        if (res.success) {
          setFeedback({ type: 'success', message: 'User created successfully!' });
        }
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save user.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (id === user?._id) {
      setFeedback({ type: 'error', message: 'You cannot delete your own logged-in account!' });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'User deleted successfully.' });
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>User Management (Admin Console)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage student customers, lab store staff, and faculty admin credentials
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin (Faculty In-Charge)</option>
              <option value="Staff">Staff (Store Manager)</option>
              <option value="Customer">Customer (Student / Club)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user accounts..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No users found" description="Try modifying your search or filter." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Campus Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const roleStyles = {
                    Admin: 'bg-purple-100 text-purple-800 border-purple-200',
                    Staff: 'bg-blue-100 text-blue-800 border-blue-200',
                    Customer: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  };

                  return (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            roleStyles[u.role] || 'bg-gray-100'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{u.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{u.address || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {u._id !== user?._id && (
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingUser ? 'Edit User Profile' : 'Add New User Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Prof. Rajesh Sharma"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@rental.edu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Password {editingUser ? '(leave blank to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Min 6 characters'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address / Department</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Faculty Block B, Campus"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingUser ? 'Save Updates' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
