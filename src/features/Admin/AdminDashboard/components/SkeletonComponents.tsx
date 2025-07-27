// src/features/Admin/AdminDashboard/components/SkeletonComponents.tsx
// ENTERPRISE: Skeleton placeholders for instant loading experience
import React from 'react';

// ENTERPRISE: Header skeleton for instant perceived performance
export const HeaderSkeleton: React.FC = () => (
  <div className="p-4 sm:p-6 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        {/* Avatar skeleton */}
        <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gray-200"></div>
        
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
        {/* Notification bell skeleton */}
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        
        {/* Role switcher skeleton */}
        <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
        
        {/* Logout button skeleton */}
        <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Stat card skeleton for instant layout
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="h-5 bg-gray-200 rounded w-32"></div>
    </div>
    
    <div className="space-y-6">
      <div>
        <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
      <div>
        <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Quick actions skeleton
export const QuickActionSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-5 animate-pulse">
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="w-7 h-7 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

// ENTERPRISE: Complete dashboard skeleton layout
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
      {/* Header Skeleton */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg relative z-50">
        <HeaderSkeleton />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-12 bg-gray-300 rounded-full"></div>
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </div>
      </div>
    </div>
  </div>
);

// ENTERPRISE: Error state component with professional design
export const DashboardError: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
    <div className="bg-white/90 backdrop-blur-md rounded-xl border border-red-200 shadow-lg text-center px-8 py-12 max-w-lg">
      {/* Error icon */}
      <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-[#1B0A3F] mb-3">Unable to Load Dashboard</h2>
      <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
      
      <button
        onClick={onRetry}
        className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Try Again
      </button>
      
      <p className="text-sm text-gray-500 mt-4">
        If the problem persists, please contact support.
      </p>
    </div>
  </div>
);