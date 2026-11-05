/**
 * EquipmentPage.jsx
 * Equipment inventory with search, filters, sorting, pagination, and CRUD + Booking modals
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import Pagination from '../components/Pagination.jsx';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  Shield,
  Edit,
  Trash2,
  CalendarPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function EquipmentPage() {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters, search & pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Equipment Form State (Controlled inputs)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    modelNumber: '',
    serialNumber: '',
    dailyRate: '',
    securityDeposit: '',
    status: 'Available',
    condition: 'Good',
    description: '',
    imageUrl: '',
  });

  // Booking Form State (Controlled inputs)
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory, selectedStatus, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err.message);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      let query = `?page=${currentPage}&limit=12`;
      if (selectedCategory !== 'All') query += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedStatus !== 'All') query += `&status=${encodeURIComponent(selectedStatus)}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      if (sortBy === 'price_asc') query += `&sortBy=price&order=asc`;
      else if (sortBy === 'price_desc') query += `&sortBy=price&order=desc`;
      else if (sortBy === 'name') query += `&sortBy=name&order=asc`;
      else query += `&sortBy=newest`;

      const res = await api.getEquipment(query);
      if (res.success) {
        setEquipmentList(res.equipment);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch equipment list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEquipment();
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      modelNumber: '',
      serialNumber: '',
      dailyRate: '',
      securityDeposit: '',
      status: 'Available',
      condition: 'Good',
      description: '',
      imageUrl: '',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      modelNumber: item.modelNumber || '',
      serialNumber: item.serialNumber || '',
      dailyRate: item.dailyRate,
      securityDeposit: item.securityDeposit,
      status: item.status,
      condition: item.condition,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Booking Modal
  const openBookModal = (item) => {
    setSelectedItem(item);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setBookingData({
      startDate: today,
      endDate: tomorrow,
      notes: '',
    });
    setIsBookModalOpen(true);
  };

  // Handle Create Equipment
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.dailyRate) {
      setFeedback({ type: 'error', message: 'Name, Category, and Daily Rate are mandatory fields.' });
      return;
    }

    try {
      const res = await api.createEquipment(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Equipment item added successfully!' });
        setIsAddModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create equipment.' });
    }
  };

  // Handle Edit Equipment
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateEquipment(selectedItem._id, formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Equipment updated successfully!' });
        setIsEditModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update equipment.' });
    }
  };

  // Handle Delete Equipment
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;

    try {
      const res = await api.deleteEquipment(id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Equipment deleted from inventory.' });
        fetchEquipment();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete equipment.' });
    }
  };

  // Handle Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.startDate || !bookingData.endDate) {
      setFeedback({ type: 'error', message: 'Both start and end dates are required.' });
      return;
    }

    try {
      const res = await api.createBooking({
        equipmentId: selectedItem._id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        notes: bookingData.notes,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message || 'Equipment booked successfully!' });
        setIsBookModalOpen(false);
        fetchEquipment();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to book equipment.' });
    }
  };

  // Calculate estimated cost for booking modal
  const calculateDaysAndCost = () => {
    if (!bookingData.startDate || !bookingData.endDate || !selectedItem) {
      return { days: 1, cost: selectedItem?.dailyRate || 0, deposit: selectedItem?.securityDeposit || 0 };
    }
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diff = Math.max(0, end.getTime() - start.getTime());
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    const cost = days * selectedItem.dailyRate;
    return { days, cost, deposit: selectedItem.securityDeposit };
  };

  const bookingEst = calculateDaysAndCost();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>{canManage ? 'Equipment Inventory Management' : 'Rentable Equipment Catalog'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse tools, cameras, and test instruments with live availability and deposit rates
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Equipment</span>
          </button>
        )}
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Search, Filter, Sort Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, model, serial..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching equipment inventory..." />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try modifying your search keywords or clear the category and status filters."
          actionText={canManage ? 'Add Equipment' : 'Clear Filters'}
          onAction={
            canManage
              ? openAddModal
              : () => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipmentList.map((item) => {
            const isAvailable = item.status === 'Available';
            const statusColors = {
              Available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              Booked: 'bg-amber-100 text-amber-800 border-amber-200',
              Rented: 'bg-blue-100 text-blue-800 border-blue-200',
              Maintenance: 'bg-red-100 text-red-800 border-red-200',
            };

            return (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
              >
                {/* Equipment Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs ${
                        statusColors[item.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-900/80 text-white backdrop-blur-xs">
                      {item.categoryName}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-3">{item.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg mb-3">
                      <div>
                        <span className="text-gray-500 block">Daily Rate:</span>
                        <span className="font-bold text-gray-900 text-xs">₹{item.dailyRate}/day</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Deposit:</span>
                        <span className="font-semibold text-blue-700 text-xs">₹{item.securityDeposit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Condition:</span>
                        <span className="font-medium text-gray-800">{item.condition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Model No:</span>
                        <span className="font-mono text-gray-600 truncate block">{item.modelNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Customer Action */}
                    {isAvailable ? (
                      <button
                        onClick={() => openBookModal(item)}
                        className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-400 py-1.5 px-2 bg-gray-100 rounded-lg flex-1 text-center">
                        {item.status}
                      </span>
                    )}

                    {/* Staff / Admin Actions */}
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Equipment"
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            title="Delete Equipment"
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ADD EQUIPMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Add Equipment to Inventory</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sony FX3 Cinema Camera 4K"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Daily Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    placeholder="1200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    placeholder="3500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    placeholder="e.g. MOD-8820"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g. SN-99120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key specifications, included accessories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EQUIPMENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Edit Equipment Details</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-600" />
                <span>Reserve Equipment Booking</span>
              </h3>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl mb-4 text-xs">
              <div className="font-bold text-blue-900 text-sm mb-1">{selectedItem.name}</div>
              <div className="text-blue-700 flex justify-between">
                <span>Daily Rate: ₹{selectedItem.dailyRate}/day</span>
                <span>Refundable Deposit: ₹{selectedItem.securityDeposit}</span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Purpose / Project Notes</label>
                <textarea
                  rows={2}
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  placeholder="e.g. Media lab workshop assignment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Duration:</span>
                  <span className="font-semibold text-gray-900">{bookingEst.days} day(s)</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Rental Charge ({bookingEst.days} × ₹{selectedItem.dailyRate}):</span>
                  <span className="font-semibold text-gray-900">₹{bookingEst.cost}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-semibold text-blue-700">₹{bookingEst.deposit}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-700">₹{bookingEst.cost + bookingEst.deposit}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
