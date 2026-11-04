/**
 * AlertBanner.jsx
 * Shows success, error, or info feedback banner
 */

import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function AlertBanner({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const icons = {
    error: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className={`flex items-center justify-between p-3.5 mb-4 border rounded-lg text-sm ${styles[type] || styles.error}`}>
      <div className="flex items-center gap-2.5">
        {icons[type] || icons.error}
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded text-gray-500 hover:text-gray-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
