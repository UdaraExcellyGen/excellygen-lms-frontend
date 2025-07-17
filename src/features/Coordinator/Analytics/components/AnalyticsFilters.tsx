// src/features/Coordinator/Analytics/components/AnalyticsFilters.tsx
import React from 'react';
import { ApiCourseCategory, EnrollmentStatus } from '../types/analytics';

interface AnalyticsFiltersProps {
  categories: ApiCourseCategory[];
  selectedCategoryId: number | null;
  enrollmentStatus: EnrollmentStatus;
  onCategoryChange: (categoryId: number | null) => void;
  onStatusChange: (status: EnrollmentStatus) => void;
  loading?: boolean;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  categories,
  selectedCategoryId,
  enrollmentStatus,
  onCategoryChange,
  onStatusChange,
  loading = false
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-[#BF4BF6]/20">
      <h3 className="text-lg font-['Unbounded'] text-[#1B0A3F] mb-4">Analytics Filters</h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#1B0A3F] mb-2">
            Course Category
          </label>
          <select
            className="w-full bg-[#F6E6FF] px-4 py-3 rounded-lg text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6] focus:outline-none transition-all duration-200"
            value={selectedCategoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
            disabled={loading || categories.length === 0}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.totalCourses} courses, {category.totalEnrollments} enrollments)
              </option>
            ))}
          </select>
        </div>

        {/* Enrollment Status Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#1B0A3F] mb-2">
            Enrollment Status
          </label>
          <select
            className="w-full bg-[#F6E6FF] px-4 py-3 rounded-lg text-[#52007C] border-none focus:ring-2 focus:ring-[#BF4BF6] focus:outline-none transition-all duration-200"
            value={enrollmentStatus}
            onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus)}
            disabled={loading}
          >
            <option value={EnrollmentStatus.ALL}>All Enrollments</option>
            <option value={EnrollmentStatus.ONGOING}>Ongoing Only</option>
            <option value={EnrollmentStatus.COMPLETED}>Completed Only</option>
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="mt-4 text-sm text-gray-600">
        {selectedCategoryId ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#BF4BF6]/10 text-[#52007C] mr-2">
            Category: {categories.find(c => c.id === selectedCategoryId)?.name}
          </span>
        ) : null}
        
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#52007C]/10 text-[#52007C]">
          Status: {enrollmentStatus === EnrollmentStatus.ALL ? 'All Enrollments' : 
                   enrollmentStatus === EnrollmentStatus.ONGOING ? 'Ongoing' : 'Completed'}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsFilters;