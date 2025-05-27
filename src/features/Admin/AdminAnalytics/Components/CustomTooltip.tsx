import React from 'react';
import { TooltipProps } from '../types/AdminAnalytics';

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-lg border border-[#BF4BF6]/20">
        <p className="text-sm font-semibold text-[#1B0A3F]">{payload[0].name}</p>
        <p className="text-sm text-[#BF4BF6]">Value: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;