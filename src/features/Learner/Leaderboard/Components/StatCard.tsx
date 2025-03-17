import React from 'react';

const StatCard = ({ label, value, Icon }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-[#F6E6FF]">
          <Icon className="h-6 w-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;