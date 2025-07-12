import React from 'react';
import { CustomTooltipProps } from '../types/analytics';

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
        <p className="text-sm font-semibold">{payload[0].name || payload[0].payload.course}</p>
        <p className="text-sm text-[#52007C]">Learners: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;