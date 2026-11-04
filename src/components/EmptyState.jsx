/**
 * EmptyState.jsx
 * Displays clear empty state feedback when no records exist
 */

import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your filters, search terms, or add a new record.',
  actionText,
  onAction,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-4 text-center bg-gray-50/70 border border-dashed border-gray-200 rounded-xl">
      <div className="w-12 h-12 mb-3 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
