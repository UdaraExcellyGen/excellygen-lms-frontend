import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { QuizPerformanceProps } from '../types/analytics';
import CustomTooltip from './CustomTooltip';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

// NEW: A modern, elegant StatCard component for consistency
const StatCard = ({ icon: Icon, label, value, description, colorClass }: { icon: React.ElementType, label: string, value: string | number, description: string, colorClass: string }) => (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${colorClass}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 font-['Nunito_Sans']">{label}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-[#1B0A3F] font-['Unbounded']">{value}</p>
                    <p className="text-xs text-gray-400 font-['Nunito_Sans']">{description}</p>
                </div>
            </div>
        </div>
    </div>
);


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
  const coordinatorCourses = availableCourses.filter(course => course.isCreatedByCurrentCoordinator);
  
  const totalStudents = performanceData.reduce((sum, item) => sum + item.count, 0);
  const selectedQuiz = availableQuizzes.find(quiz => quiz.quizId === selectedQuizId);
  
  const passCount = performanceData
      .filter(item => item.minMark >= 60)
      .reduce((sum, item) => sum + item.count, 0);
  
  const passRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-xl font-['Unbounded'] text-[#1B0A3F] mb-1 flex items-center gap-2">
            <BarChart3 size={24} className="text-[#52007C]" />
            Quiz Performance Analysis
          </h2>
          <p className="text-gray-500 font-['Nunito_Sans']">
            Student performance distribution by mark range.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-md">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1B0A3F] mb-2 font-['Nunito_Sans']">
              Select Your Course
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all"
              value={selectedCourseId ?? ''}
              onChange={(e) => onCourseChange(Number(e.target.value))}
              disabled={coordinatorCourses.length === 0 || loading}
            >
              <option value="" disabled>
                {coordinatorCourses.length === 0 ? 'No courses created' : 'Select a Course'}
              </option>
              {coordinatorCourses.map((course) => (
                <option key={course.courseId} value={course.courseId} title={course.courseTitle}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1B0A3F] mb-2 font-['Nunito_Sans']">
              Select Quiz
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all"
              value={selectedQuizId ?? ''}
              onChange={(e) => onQuizChange(Number(e.target.value))}
              disabled={availableQuizzes.length === 0 || !selectedCourseId || loading}
            >
              <option value="" disabled>
                {!selectedCourseId ? 'Select course first' : availableQuizzes.length === 0 ? 'No quizzes in course' : 'Select a Quiz'}
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
      </div>

      {selectedQuiz && performanceData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Students" value={totalStudents} description="participated" colorClass="bg-gradient-to-br from-[#BF4BF6] to-[#52007C]" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${selectedQuiz.averageScore.toFixed(1)}%`} description="class average" colorClass="bg-gradient-to-br from-[#D68BF9] to-[#7A00B8]" />
          <StatCard icon={Target} label="Pass Rate (≥60%)" value={`${passRate.toFixed(1)}%`} description={`${passCount} of ${totalStudents} passed`} colorClass="bg-gradient-to-br from-[#0609C6] to-[#03045e]" />
          <StatCard icon={BarChart3} label="Total Attempts" value={selectedQuiz.totalAttempts} description="quiz attempts" colorClass="bg-gradient-to-br from-[#34137C] to-[#1B0A3F]" />
        </div>
      )}

      <div className="h-80">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#52007C] mb-4"></div><p className="text-[#52007C] text-lg font-['Nunito_Sans']">Loading Quiz Data...</p></div>
        ) : performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BF4BF6" />
                    <stop offset="100%" stopColor="#52007C" />
                  </linearGradient>
                </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#333', fontFamily: 'Nunito Sans' }} axisLine={false} tickLine={false} label={{ value: 'Marks Range (%)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '14px', fill: '#1B0A3F', fontFamily: 'Nunito Sans' } }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#333', fontFamily: 'Nunito Sans' }} tickFormatter={(value) => Math.floor(value).toString()} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }} />
              {/* CORRECTED: Removed radius prop for sharp edges */}
              <Bar dataKey="count" fill="url(#quizGradient)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center"><BarChart3 size={48} className="text-[#BF4BF6] mb-4" /><p className="text-[#1B0A3F] text-lg mb-2 font-['Unbounded']">No Performance Data</p><p className="text-gray-500 font-['Nunito_Sans']">{!selectedCourseId ? 'Select one of your courses to begin.' : 'Please select a quiz to view analytics.'}</p></div>
        )}
      </div>
    </div>
  );
};

export default QuizPerformance;