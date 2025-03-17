import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { availabilityData } from '../data/mockData';
import CustomTooltip from './CustomTooltip';

const CourseAvailability: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6">Course Availability</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={availabilityData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#52007C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CourseAvailability;