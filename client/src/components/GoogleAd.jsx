import React from 'react';

export default function GoogleAd({ slot }) {
  // Simple placeholder for Google Ad
  // In production, this would integrate with Google AdSense
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-sm">
          Advertisement Space
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Slot: {slot || 'default'}
        </p>
      </div>
    </div>
  );
}

