import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { enrollmentData } from '../data/mockData';

const Enrollment: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4">
      <h2 className="text-xl font-['Unbounded'] mb-6">Enrollment Analytics</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={enrollmentData} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" />
            <Tooltip 
              cursor={{ fill: 'rgba(82, 0, 124, 0.1)' }} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                      <p className="text-sm font-semibold">{payload[0].payload.name}</p>
                      <p className="text-sm text-[#52007C]">Enrollments: {payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }} 
            />
            <Bar dataKey="value" fill="#52007C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Enrollment;