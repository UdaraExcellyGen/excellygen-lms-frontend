// src/components/QuizPerformance.tsx
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
import { QuizPerformanceProps as NewQuizPerformanceProps } from '../types/analytics';
import CustomTooltip from './CustomTooltip';

const QuizPerformance: React.FC<NewQuizPerformanceProps> = ({
  availableCourses,
  selectedCourseId,
  onCourseChange,
  availableQuizzes,
  selectedQuizId,
  onQuizChange,
  performanceData,
}) => (
  <div className="bg-white rounded-2xl p-6 mt-6"> {/* Added mt-6 for spacing */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
      <h2 className="text-xl font-['Unbounded'] mb-4 sm:mb-0">Quiz Performance</h2>
      <div className="flex gap-4">
        <select
          className="bg-[#F6E6FF] px-4 py-2 rounded-md text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6]"
          value={selectedCourseId ?? ''} // Handle null case for value
          onChange={(e) => onCourseChange(Number(e.target.value))}
          disabled={availableCourses.length === 0}
        >
          <option value="" disabled>Select a Course</option>
          {availableCourses.map((course) => (
            <option key={course.courseId} value={course.courseId}>{course.courseTitle}</option>
          ))}
        </select>

        <select
          className="bg-[#F6E6FF] px-4 py-2 rounded-md text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6]"
          value={selectedQuizId ?? ''} // Handle null case for value
          onChange={(e) => onQuizChange(Number(e.target.value))}
          disabled={availableQuizzes.length === 0 || !selectedCourseId}
        >
          <option value="" disabled>Select a Quiz</option>
          {availableQuizzes.map((quiz) => (
            <option key={quiz.quizId} value={quiz.quizId}>{quiz.quizTitle}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="h-80">
      {performanceData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={performanceData} // Use the new performanceData prop
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }} 
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="range"
              label={{
                value: 'Marks Range',
                position: 'insideBottom',
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
              }}
              
              textAnchor="middle"
              interval={0} 
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{
                value: 'Number of Learners',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
              }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#52007C"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          {selectedQuizId ? 'No performance data available for this quiz.' : 'Select a course and quiz to view performance.'}
        </div>
      )}
    </div>
  </div>
);

export default QuizPerformance;