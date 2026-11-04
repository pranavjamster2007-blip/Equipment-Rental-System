/**
 * InspectionsPage.jsx
 * Inspection log for equipment condition ratings and damage assessments
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Plus,
  X,
} from 'lucide-react';

export default function InspectionsPage() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    inspectionType: 'Pickup',
    conditionRating: 'Good',
    damageNotes: '',
    repairCostEstimate: 0,
    cleanState: true,
    approved: true,
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Staff';

  useEffect(() => {
    fetchInspections();
    fetchEquipment();
  }, [typeFilter]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      let query = '';
      if (typeFilter !== 'All') query = `?type=${typeFilter}`;
      const res = await api.getInspections(query);
      if (res.success) {
        setInspections(res.inspections);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch inspections' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await api.getEquipment('?limit=50');
      if (res.success) {
        setEquipmentList(res.equipment);
        if (res.equipment.length > 0 && !formData.equipmentId) {
          setFormData((prev) => ({
            ...prev,
            equipmentId: res.equipment[0]._id,
            equipmentName: res.equipment[0].name,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipmentId) {
      setFeedback({ type: 'error', message: 'Please select an equipment item.' });
      return;
    }

    try {
      const selected = equipmentList.find((e) => e._id === formData.equipmentId);
      const res = await api.createInspection({
        ...formData,
        equipmentName: selected?.name || formData.equipmentName,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Inspection log created successfully!' });
        setIsModalOpen(false);
        fetchInspections();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create inspection report' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            <span>Inspection & Damage Notes Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit trails of equipment condition at pickup dispatch and return checkout
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Inspection Log</span>
          </button>
        )}
      </div>

      <AlertBanner
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: '', message: '' })}
      />

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 max-w-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="All">All Inspection Types</option>
            <option value="Pickup">Pickup Handover Inspections</option>
            <option value="Return">Return Checkout Inspections</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading inspection audits..." />
      ) : inspections.length === 0 ? (
        <EmptyState
          title="No inspection records found"
          description="Inspections are automatically logged when equipment is picked up or returned, or you can record a manual inspection check."
          actionText="Log Inspection"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Inspection Type</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Condition Rating</th>
                  <th className="py-3 px-4">Inspector</th>
                  <th className="py-3 px-4">Damage / Wear Notes</th>
                  <th className="py-3 px-4">Repair Fee</th>
                  <th className="py-3 px-4">Clean State</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspections.map((insp) => {
                  const ratingColors = {
                    Excellent: 'bg-emerald-100 text-emerald-800',
                    Good: 'bg-blue-100 text-blue-800',
                    Fair: 'bg-amber-100 text-amber-800',
                    Damaged: 'bg-red-100 text-red-800 font-bold',
                  };

                  return (
                    <tr key={insp._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            insp.inspectionType === 'Pickup'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {insp.inspectionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{insp.equipmentName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            ratingColors[insp.conditionRating] || 'bg-gray-100'
                          }`}
                        >
                          {insp.conditionRating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{insp.inspectorName}</td>
                      <td className="py-3 px-4 max-w-xs text-gray-600 truncate">
                        {insp.damageNotes || 'No issues found'}
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {insp.repairCostEstimate > 0 ? `₹${insp.repairCostEstimate}` : '₹0'}
                      </td>
                      <td className="py-3 px-4">
                        {insp.cleanState ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Clean
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Dirty/Wear
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-[11px]">
                        {new Date(insp.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <span>Record Equipment Inspection Log</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Equipment *</label>
                <select
                  required
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.name} ({eq.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Inspection Type</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Pickup">Pickup Handover</option>
                    <option value="Return">Return Checkout</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Condition Rating</label>
                  <select
                    value={formData.conditionRating}
                    onChange={(e) => setFormData({ ...formData, conditionRating: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Damage / Physical Assessment Notes</label>
                <textarea
                  rows={2}
                  value={formData.damageNotes}
                  onChange={(e) => setFormData({ ...formData, damageNotes: e.target.value })}
                  placeholder="Record any physical findings, sensor checks, cables, accessories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Repair Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.repairCostEstimate}
                  onChange={(e) => setFormData({ ...formData, repairCostEstimate: Number(e.target.value) })}
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Inspection Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
