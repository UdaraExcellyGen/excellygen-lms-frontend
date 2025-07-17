// src/features/Coordinator/Analytics/components/CustomTooltip.tsx
import React from 'react';
import { CustomTooltipProps } from '../types/analytics';

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // For enrollment charts
    if (data.fullCourseName) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <div className="font-semibold text-[#1B0A3F] mb-2 break-words">
            {data.fullCourseName}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-[#52007C] font-medium">
              Enrollments: <span className="font-bold">{payload[0].value}</span>
            </p>
            {data.categoryName && (
              <p className="text-gray-600">
                Category: <span className="font-medium">{data.categoryName}</span>
              </p>
            )}
            {data.coordinatorName && (
              <p className="text-gray-600">
                Coordinator: <span className="font-medium">{data.coordinatorName}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    
    // For quiz performance charts
    if (data.range && data.percentage !== undefined) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="font-semibold text-[#1B0A3F] mb-2">
            Marks Range: {data.range}%
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-[#52007C] font-medium">
              Students: <span className="font-bold">{data.count}</span>
            </p>
            <p className="text-gray-600">
              Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </p>
            <p className="text-gray-500 text-xs">
              Score range: {data.minMark}% - {data.maxMark}%
            </p>
          </div>
        </div>
      );
    }
    
    // Fallback for basic charts
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-[#1B0A3F]">
          {payload[0].name || label}
        </p>
        <p className="text-sm text-[#52007C]">
          Value: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  
  return null;
};

export default CustomTooltip;