// src/features/Coordinator/Analytics/components/QuizPerformance.tsx
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
  availableCourses,
  selectedCourseId,
  onCourseChange,
  availableQuizzes,
  selectedQuizId,
  onQuizChange,
  performanceData,
  loading = false
}) => {
  // Filter to show only coordinator-created courses
  const coordinatorCourses = availableCourses.filter(course => course.isCreatedByCurrentCoordinator);
  
  // Calculate quiz statistics
  const totalStudents = performanceData.reduce((sum, item) => sum + item.count, 0);
  const selectedQuiz = availableQuizzes.find(quiz => quiz.quizId === selectedQuizId);
  
  // Calculate pass rate (assuming 60% is pass mark)
  const passRate = totalStudents > 0 
    ? performanceData
        .filter(item => item.minMark >= 60)
        .reduce((sum, item) => sum + item.count, 0) / totalStudents * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#BF4BF6]/20">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-xl font-['Unbounded'] text-[#1B0A3F] mb-2">
            Quiz Performance Analysis
          </h2>
          <p className="text-gray-600 font-['Nunito_Sans']">
            Student performance distribution by marks range
          </p>
        </div>
        
        {/* Course and Quiz Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 min-w-0 lg:min-w-[400px]">
          <select
            className="flex-1 bg-[#F6E6FF] px-4 py-3 rounded-lg text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6] focus:outline-none transition-all duration-200"
            value={selectedCourseId ?? ''}
            onChange={(e) => onCourseChange(Number(e.target.value))}
            disabled={coordinatorCourses.length === 0 || loading}
          >
            <option value="" disabled>
              {coordinatorCourses.length === 0 ? 'No courses available' : 'Select a Course'}
            </option>
            {coordinatorCourses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseTitle}
                {course.totalEnrollments > 0 && ` (${course.totalEnrollments} students)`}
              </option>
            ))}
          </select>

          <select
            className="flex-1 bg-[#F6E6FF] px-4 py-3 rounded-lg text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6] focus:outline-none transition-all duration-200"
            value={selectedQuizId ?? ''}
            onChange={(e) => onQuizChange(Number(e.target.value))}
            disabled={availableQuizzes.length === 0 || !selectedCourseId || loading}
          >
            <option value="" disabled>
              {!selectedCourseId 
                ? 'Select course first' 
                : availableQuizzes.length === 0 
                  ? 'No quizzes available' 
                  : 'Select a Quiz'
              }
            </option>
            {availableQuizzes.map((quiz) => (
              <option key={quiz.quizId} value={quiz.quizId}>
                {quiz.quizTitle}
                {quiz.totalAttempts > 0 && ` (${quiz.totalAttempts} attempts)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Statistics */}
      {selectedQuiz && performanceData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-[#52007C]/10 to-[#BF4BF6]/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-[#52007C]">{totalStudents}</div>
            <div className="text-xs text-gray-600">Total Students</div>
          </div>
          <div className="bg-gradient-to-r from-[#BF4BF6]/10 to-[#52007C]/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-[#BF4BF6]">{selectedQuiz.averageScore.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Average Score</div>
          </div>
          <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{passRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Pass Rate (≥60%)</div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{selectedQuiz.totalAttempts}</div>
            <div className="text-xs text-gray-600">Total Attempts</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#52007C] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading quiz performance data...</p>
            </div>
          </div>
        ) : performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }} 
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="range"
                label={{
                  value: 'Marks Range (%)',
                  position: 'insideBottom',
                  offset: -15, 
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#1B0A3F' }
                }}
                textAnchor="middle"
                interval={0} 
                tick={{ fontSize: 12, fill: '#1B0A3F' }}
              />
              <YAxis
                label={{
                  value: 'Number of Students',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#1B0A3F' }
                }}
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#1B0A3F' }}
                tickFormatter={(value) => Math.floor(value).toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#52007C"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">
                {selectedQuizId 
                  ? 'No performance data available for this quiz' 
                  : 'Select a course and quiz to view performance data'
                }
              </p>
              <p className="text-gray-400 text-sm">
                {!selectedCourseId 
                  ? 'Choose a course from your created courses to get started'
                  : !selectedQuizId 
                    ? 'Select a quiz to analyze student performance'
                    : 'This quiz has no student attempts yet'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Course Information */}
      {coordinatorCourses.length === 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">No Courses Found</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You haven't created any courses yet. Only courses you've created as a coordinator will appear here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {!loading && performanceData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded">
              📈 Performance by 20% intervals
            </span>
            <span className="px-2 py-1 bg-[#52007C]/10 text-[#52007C] rounded">
              🎯 Showing only your courses
            </span>
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              💡 Hover over bars for detailed breakdown
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPerformance;