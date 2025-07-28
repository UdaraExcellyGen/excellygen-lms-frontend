// src/features/Admin/ManageUsers/components/UserSkeletons.tsx
// ENTERPRISE: Professional skeleton components for instant loading
import React from 'react';

// ENTERPRISE: Statistics skeleton
export const UserStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4">
    {Array(4).fill(0).map((_, index) => (
      <div key={index} className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 shadow-lg animate-pulse">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ENTERPRISE: Filter bar skeleton
export const FilterBarSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 border border-[#BF4BF6]/20 shadow-lg animate-pulse">
    <div className="grid md:grid-cols-5 gap-4">
      <div className="md:col-span-3 h-12 bg-gray-200 rounded-lg"></div>
      <div className="md:col-span-1 h-12 bg-gray-200 rounded-lg"></div>
      <div className="md:col-span-1 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// ENTERPRISE: Table skeleton
export const UserTableSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F6E6FF]">
            <th className="px-3 py-3 text-left w-[15%]">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </th>
            <th className="px-3 py-3 text-left w-[18%]">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </th>
            <th className="px-3 py-3 text-left w-[30%]">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </th>
            <th className="px-3 py-3 text-left w-[17%]">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </th>
            <th className="px-3 py-3 text-left w-[10%]">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </th>
            <th className="px-3 py-3 text-left w-[10%]">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array(10).fill(0).map((_, index) => (
            <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}`}>
              <td className="px-3 py-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center">
                  <div className="h-6 bg-gray-200 rounded-full w-16 mr-2"></div>
                  <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ENTERPRISE: Complete page skeleton
export const ManageUserSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
      
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-full mr-2"></div>
          <div className="h-8 bg-white/20 rounded w-48"></div>
        </div>
        <div className="h-11 bg-white/20 rounded-lg w-40"></div>
      </div>

      {/* Stats skeleton */}
      <UserStatsSkeleton />

      {/* Filter skeleton */}
      <FilterBarSkeleton />

      {/* Table skeleton */}
      <UserTableSkeleton />
    </div>
  </div>
);