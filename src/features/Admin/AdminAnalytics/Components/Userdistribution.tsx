import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { userDistributionData } from '../data/mockData';
import CustomTooltip from './CustomTooltip';

const UserDistribution: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6">User Distribution</h2>
      <div className="h-64 relative">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex justify-center gap-6 z-10">
          {userDistributionData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 40 }}>
            <Pie data={userDistributionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cy={120}>
              {userDistributionData.map((entry, index) => (
                <Cell key={index} fill={entry.color || '#ccc'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserDistribution;