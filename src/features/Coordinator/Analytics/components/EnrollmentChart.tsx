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
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <XAxis 
            dataKey="course" 
            //angle={-180}
            textAnchor="middle"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
            label={{ 
              value: 'Courses', 
              position: 'insideBottom', 
              offset: 5,
              style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
            }}
          />
          <YAxis 
            label={{ 
              value: 'Number of Learners', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#52007C" 
            radius={[4, 4, 0, 0]}
            
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default EnrollmentChart;