import React from 'react';
import {
  LineChart,
  Line,
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

    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={quizData[selectedCourse]?.[selectedQuiz] || []}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#52007C"
            strokeWidth={2}
            dot={{ fill: "#52007C", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default QuizPerformance;