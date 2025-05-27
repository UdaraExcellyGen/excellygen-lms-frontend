import React from 'react';

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-sm p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="w-full">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-5 bg-gray-200 rounded w-full"></div>
      <div className="h-5 bg-gray-200 rounded w-full"></div>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;