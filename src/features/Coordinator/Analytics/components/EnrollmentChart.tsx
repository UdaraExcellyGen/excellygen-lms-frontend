// src/features/Coordinator/Analytics/components/EnrollmentChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { EnrollmentChartProps, EnrollmentStatus } from '../types/analytics';
import CustomTooltip from './CustomTooltip';
import AnalyticsFilters from './AnalyticsFilters';

const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ 
  data, 
  categories,
  selectedCategoryId,
  enrollmentStatus,
  onCategoryChange,
  onStatusChange,
  loading = false 
}) => {
  // Get status label for display
  const getStatusLabel = (status: EnrollmentStatus): string => {
    switch (status) {
      case EnrollmentStatus.ALL:
        return 'All Enrollments';
      case EnrollmentStatus.ONGOING:
        return 'Ongoing Enrollments';
      case EnrollmentStatus.COMPLETED:
        return 'Completed Enrollments';
      default:
        return 'Enrollments';
    }
  };

  // Get chart color based on status
  const getBarColor = (status: EnrollmentStatus): string => {
    switch (status) {
      case EnrollmentStatus.ALL:
        return '#52007C';
      case EnrollmentStatus.ONGOING:
        return '#BF4BF6';
      case EnrollmentStatus.COMPLETED:
        return '#34A853';
      default:
        return '#52007C';
    }
  };

  // Calculate total enrollments for display
  const totalEnrollments = data.reduce((sum, item) => sum + item.count, 0);
  const totalCourses = data.length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AnalyticsFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        enrollmentStatus={enrollmentStatus}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
        loading={loading}
      />

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#BF4BF6]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-['Unbounded'] text-[#1B0A3F] mb-2">
              Course Enrollment Analytics
            </h2>
            <p className="text-gray-600 font-['Nunito_Sans']">
              {getStatusLabel(enrollmentStatus)} by Course
            </p>
          </div>
          
          {/* Summary Stats */}
          <div className="flex gap-4 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#52007C]">{totalCourses}</div>
              <div className="text-xs text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#BF4BF6]">{totalEnrollments}</div>
              <div className="text-xs text-gray-600">Total Enrollments</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#52007C] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading enrollment data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">No enrollment data available</p>
              <p className="text-gray-400 text-sm">
                {selectedCategoryId 
                  ? 'Try selecting a different category or status filter'
                  : 'No courses found for the selected filters'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="course" 
                  textAnchor="middle"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 11, fill: "#1B0A3F" }}
                  angle={-45}
                  label={{ 
                    value: 'Courses', 
                    position: 'insideBottom', 
                    offset: -5,
                    style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold', fill: '#1B0A3F' }
                  }}
                />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  tickCount={6}
                  tick={{ fontSize: 12, fill: "#1B0A3F" }}
                  tickMargin={10}
                  tickFormatter={(value) => Math.floor(value).toString()}
                  axisLine={false}
                  label={{ 
                    value: "Number of Learners", 
                    position: "insideLeft",
                    angle: -90,
                    style: { textAnchor: 'middle', fill: "#1B0A3F", fontSize: '14px', fontWeight: 'bold' },
                    offset: 10
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill={getBarColor(enrollmentStatus)}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Additional Information */}
        {!loading && data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded">
                📊 Showing {data.length} courses
              </span>
              {selectedCategoryId && (
                <span className="px-2 py-1 bg-[#BF4BF6]/10 text-[#52007C] rounded">
                  📂 Category: {categories.find(c => c.id === selectedCategoryId)?.name}
                </span>
              )}
              <span className="px-2 py-1 bg-[#52007C]/10 text-[#52007C] rounded">
                🎯 {getStatusLabel(enrollmentStatus)}
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                💡 Hover over bars for detailed information
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentChart;