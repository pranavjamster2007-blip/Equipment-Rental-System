/**
 * CategoriesPage.jsx
 * Category CRUD management screen
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { Layers, Plus, Edit, Trash2, X, FolderCheck } from 'lucide-react';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Layers' });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.success) {
        setCategories(res.categories);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load categories.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ name: '', description: '', icon: 'Layers' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditItem(cat);
    setFormData({ name: cat.name, description: cat.description, icon: cat.icon || 'Layers' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setFeedback({ type: 'error', message: 'Category name and description are required.' });
      return;
    }

    try {
      if (editItem) {
        const res = await api.updateCategory(editItem._id, formData);
        if (res.success) setFeedback({ type: 'success', message: 'Category updated successfully!' });
      } else {
        const res = await api.createCategory(formData);
        if (res.success) setFeedback({ type: 'success', message: 'Category created successfully!' });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await api.deleteCategory(id);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Category deleted successfully.' });
        fetchCategories();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete category.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            <span>Equipment Categories</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Classify and organize tools, lab hardware, and AV systems</p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No categories defined"
          description="Create equipment categories such as Audio/Visual, Lab Instruments, or Workshop Tools."
          actionText="Add Category"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{cat.description}</p>
              </div>

              {canManage && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editItem ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Robotics & Microcontrollers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what kind of tools and devices fall into this category..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  {editItem ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
