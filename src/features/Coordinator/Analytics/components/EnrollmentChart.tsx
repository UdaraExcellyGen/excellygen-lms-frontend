import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EnrollmentChartProps } from '../types/analytics';
import CustomTooltip from './CustomTooltip';

const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ data }) => (
  <div className="bg-white rounded-2xl p-6 mb-4">
    <h2 className="text-xl font-['Unbounded'] mb-6">Learner Enrollment</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis dataKey="course" type="category" />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#52007C" 
            radius={[0, 4, 4, 0]}
            label={{ 
              position: 'right',
              fill: '#666'
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default EnrollmentChart;