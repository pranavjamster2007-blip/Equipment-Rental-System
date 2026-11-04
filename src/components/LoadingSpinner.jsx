/**
 * LoadingSpinner.jsx
 * Shows clean loading feedback state
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading records...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
