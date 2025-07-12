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
              allowDecimals={false}
              domain={[0, 'dataMax']}
              tickCount={5}
              tick={{ fontSize: 12, fill: "#1B0A3F" }}
              tickMargin={10}
              tickFormatter={(value) => Math.floor(value).toString()}

              axisLine={false}
              label={{ 
                value: "No of Learners", 
                position: "insideLeft",
                angle: -90,
                style: { textAnchor: 'middle', fill: "#1B0A3F" },
                offset: 0
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