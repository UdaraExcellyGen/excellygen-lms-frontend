// src/features/Admin/AdminDashboard/components/StatCard.tsx
// ENTERPRISE OPTIMIZED: Real-time stat card with smooth updates
import React, { useCallback, useState, useEffect } from 'react';
import { StatCardProps } from '../types/types';

// ENTERPRISE: Enhanced props interface with real-time support
interface EnhancedStatCardProps extends StatCardProps {
  isRefreshing?: boolean;
}

const StatCard: React.FC<EnhancedStatCardProps> = React.memo(({
  icon: Icon,
  title,
  stats,
  totalLabel,
  activeLabel,
  onClick,
  isRefreshing = false
}) => {
  // ENTERPRISE: State for smooth number transitions
  const [displayStats, setDisplayStats] = useState(stats);
  const [isUpdating, setIsUpdating] = useState(false);

  // ENTERPRISE: Animate number changes for better UX
  useEffect(() => {
    if (stats.total !== displayStats.total || stats.active !== displayStats.active) {
      setIsUpdating(true);
      
      // Small delay to show the updating state
      const timer = setTimeout(() => {
        setDisplayStats(stats);
        setIsUpdating(false);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [stats, displayStats]);

  // ENTERPRISE: Memoized click handler for performance
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div
      className={`bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 transition-all duration-300 hover:shadow-xl cursor-pointer relative overflow-hidden ${
        isRefreshing || isUpdating ? 'ring-2 ring-[#BF4BF6]/30' : ''
      }`}
      onClick={handleClick}
    >
      {/* ENTERPRISE: Real-time update shimmer effect */}
      {(isRefreshing || isUpdating) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      )}
      
      {/* ENTERPRISE: Update indicator */}
      {(isRefreshing || isUpdating) && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#BF4BF6] rounded-full animate-pulse"></div>
          <span className="text-xs text-[#BF4BF6] font-medium">
            {isRefreshing ? 'Updating...' : 'Changed'}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-[#F6E6FF] transition-colors duration-300 ${
          isRefreshing || isUpdating ? 'bg-[#BF4BF6]/20' : ''
        }`}>
          <Icon 
            size={24} 
            className={`text-[#BF4BF6] transition-all duration-300 ${
              isRefreshing || isUpdating ? 'scale-110' : ''
            }`} 
          />
        </div>
        <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">{title}</h2>
      </div>
      
      <div className="space-y-6 relative z-10">
        {/* Total Stats */}
        <div className="relative">
          <p className={`text-4xl text-[#52007C] font-['Unbounded'] mb-2 transition-all duration-300 ${
            isUpdating ? 'scale-105 text-[#BF4BF6]' : ''
          }`}>
            <NumberTransition 
              value={displayStats.total} 
              isAnimating={isUpdating}
            />
          </p>
          <p className="text-gray-500 font-['Nunito_Sans']">{totalLabel}</p>
          
          {/* Change indicator for total */}
          {isUpdating && stats.total !== displayStats.total && (
            <div className="absolute -top-2 -right-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                stats.total > displayStats.total 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {stats.total > displayStats.total ? '+' : ''}
                {stats.total - displayStats.total}
              </span>
            </div>
          )}
        </div>
        
        {/* Active Stats */}
        <div className="relative">
          <p className={`text-4xl text-[#BF4BF6] font-['Unbounded'] mb-2 transition-all duration-300 ${
            isUpdating ? 'scale-105 text-[#D68BF9]' : ''
          }`}>
            <NumberTransition 
              value={displayStats.active} 
              isAnimating={isUpdating}
            />
          </p>
          <p className="text-gray-500 font-['Nunito_Sans']">{activeLabel}</p>
          
          {/* Change indicator for active */}
          {isUpdating && stats.active !== displayStats.active && (
            <div className="absolute -top-2 -right-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                stats.active > displayStats.active 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {stats.active > displayStats.active ? '+' : ''}
                {stats.active - displayStats.active}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* ENTERPRISE: Progress indicator for real-time updates */}
      {isRefreshing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] animate-pulse"></div>
        </div>
      )}
    </div>
  );
});

// ENTERPRISE: Smooth number transition component
const NumberTransition: React.FC<{ 
  value: number; 
  isAnimating: boolean; 
}> = React.memo(({ value, isAnimating }) => {
  return (
    <span className={`inline-block transition-all duration-300 ${
      isAnimating ? 'transform scale-110' : ''
    }`}>
      {value}
    </span>
  );
});

StatCard.displayName = 'StatCard';
NumberTransition.displayName = 'NumberTransition';

export default StatCard;