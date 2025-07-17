import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { EnrollmentChartProps, EnrollmentStatus, OwnershipFilter } from '../types/analytics';
import CustomTooltip from './CustomTooltip';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

// NEW: A modern, elegant StatCard component design
const StatCard = ({ icon: Icon, label, value, description }: { icon: React.ElementType, label: string, value: string | number, description: string }) => (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 p-3 rounded-full bg-[#F6E6FF]">
                <Icon className="w-6 h-6 text-[#52007C]" />
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


const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ 
  data, 
  categories,
  selectedCategoryId,
  enrollmentStatus,
  ownershipFilter,
  onCategoryChange,
  onStatusChange,
  onOwnershipChange,
  loading = false 
}) => {
  const getStatusLabel = (status: EnrollmentStatus): string => {
    switch (status) {
      case EnrollmentStatus.ALL: return 'All Enrollments';
      case EnrollmentStatus.ONGOING: return 'Ongoing Enrollments';
      case EnrollmentStatus.COMPLETED: return 'Completed Enrollments';
      default: return 'Enrollments';
    }
  };

  const getBarColor = (status: EnrollmentStatus): string => {
    switch (status) {
      case EnrollmentStatus.ALL: return 'url(#brandGradient)';
      case EnrollmentStatus.ONGOING: return 'url(#ongoingGradient)';
      case EnrollmentStatus.COMPLETED: return 'url(#completedGradient)'; // This now points to the Federal Blue gradient
      default: return 'url(#brandGradient)';
    }
  };
  
  const getOwnershipLabel = (ownership: OwnershipFilter): string => {
      return ownership === OwnershipFilter.MINE ? 'My Created Courses' : 'All Coordinator Courses';
  };

  const totalEnrollments = data.reduce((sum, item) => sum + item.count, 0);
  const totalCourses = data.length;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-[#BF4BF6]/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-['Unbounded'] text-[#1B0A3F] mb-1 flex items-center gap-2">
              <TrendingUp size={24} className="text-[#52007C]" />
              Course Enrollment Analytics
            </h2>
            <p className="text-gray-500 font-['Nunito_Sans']">
              {getOwnershipLabel(ownershipFilter)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 lg:mt-0">
            <StatCard icon={BookOpen} label="Courses Displayed" value={totalCourses} description="in selection" />
            <StatCard icon={Users} label="Total Enrollments" value={totalEnrollments} description={getStatusLabel(enrollmentStatus).toLowerCase()} />
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => onOwnershipChange(OwnershipFilter.MINE)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                ownershipFilter === OwnershipFilter.MINE
                  ? 'border-[#52007C] text-[#52007C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Created Courses
            </button>
            <button
              onClick={() => onOwnershipChange(OwnershipFilter.ALL)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                ownershipFilter === OwnershipFilter.ALL
                  ? 'border-[#52007C] text-[#52007C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Coordinator Courses
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#1B0A3F] mb-2 font-['Nunito_Sans']">
              Filter by Category
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all"
              value={selectedCategoryId ?? ''}
              onChange={(e) => onCategoryChange(e.target.value || null)}
              disabled={loading || categories.length === 0}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.totalCourses} courses)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B0A3F] mb-2 font-['Nunito_Sans']">
              Filter by Status
            </label>
            <select
              className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all"
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

        {loading ? (
            <div className="flex flex-col items-center justify-center h-80"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#52007C] mb-4"></div><p className="text-[#52007C] text-lg font-['Nunito_Sans']">Loading Analytics...</p></div>
        ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center"><BookOpen size={48} className="text-[#BF4BF6] mb-4" /><p className="text-[#1B0A3F] text-lg mb-2 font-['Unbounded']">No Enrollment Data</p><p className="text-gray-500 font-['Nunito_Sans']">No courses match the current filters.</p></div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 110 }}>
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BF4BF6" />
                    <stop offset="100%" stopColor="#52007C" />
                  </linearGradient>
                  <linearGradient id="ongoingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A00B8" />
                    <stop offset="100%" stopColor="#34137C" />
                  </linearGradient>
                  {/* CORRECTED: Using Federal Blue for the completed status */}
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#03045e" />
                    <stop offset="100%" stopColor="#03045e" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="course" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11, fill: "#333", fontFamily: "Nunito Sans" }} />
                <YAxis allowDecimals={false} tickCount={6} tick={{ fontSize: 12, fill: "#333", fontFamily: "Nunito Sans" }} tickFormatter={(value) => Math.floor(value).toString()} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}/>
                <Bar 
                  dataKey="count" 
                  fill={getBarColor(enrollmentStatus)}
                  barSize={data.length > 20 ? 20 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
    </div>
  );
};

export default EnrollmentChart;