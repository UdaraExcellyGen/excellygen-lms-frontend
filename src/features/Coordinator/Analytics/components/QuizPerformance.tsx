import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { QuizPerformanceProps } from '../types/analytics';
import CustomTooltip from './CustomTooltip';

const QuizPerformance: React.FC<QuizPerformanceProps> = ({
  quizData,
  selectedCourse,
  selectedQuiz,
  onCourseChange,
  onQuizChange,
}) => (
  <div className="bg-white rounded-2xl p-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
      <h2 className="text-xl font-['Unbounded'] mb-4 sm:mb-0">Quiz Performance</h2>
      <div className="flex gap-4">
        <select
          className="bg-[#F6E6FF] px-4 py-2 rounded-md text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6]"
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
        >
          {Object.keys(quizData).map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <select
          className="bg-[#F6E6FF] px-4 py-2 rounded-md text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6]"
          value={selectedQuiz}
          onChange={(e) => onQuizChange(e.target.value)}
        >
          {Object.keys(quizData[selectedCourse] || {}).map((quiz) => (
            <option key={quiz} value={quiz}>{quiz}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={quizData[selectedCourse]?.[selectedQuiz] || []}
          margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="range" 
            label={{ 
              value: 'Marks Range', 
              position: 'insideBottom', 
              offset: -5,
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

export default QuizPerformance;