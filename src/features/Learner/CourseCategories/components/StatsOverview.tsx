// src/features/Learner/CourseCategories/components/StatsOverview.tsx
// ENTERPRISE OPTIMIZED: Professional stats display with smooth animations
import React, { useEffect, useState, useCallback } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

interface StatsOverviewProps {
  totalCoursesOverall: number;
  totalActiveLearnersOverall: number;
}

// ENTERPRISE: Individual stat card component with animations
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}> = React.memo(({ icon, label, value, suffix = "+" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // ENTERPRISE: Smooth number animation for better UX
  const animateValue = useCallback(() => {
    const duration = 1000; // 1 second
    const steps = 60; // 60fps
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  useEffect(() => {
    // ENTERPRISE: Instant visibility for faster perceived performance
    setIsVisible(true);
    if (value > 0) {
      animateValue();
    }
  }, [value, animateValue]); // Remove delay for instant appearance

  // ENTERPRISE: Format large numbers for better readability
  const formatValue = useCallback((num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);

  return (
    <div className={`
      bg-white/85 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 
      transition-all duration-500 hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] p-6
      transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
    `}>
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] p-4 rounded-xl mr-5 shadow-lg transform transition-transform duration-300 hover:scale-105">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-[#52007C] text-sm font-medium uppercase tracking-wider mb-1 transition-colors duration-200">
            {label}
          </h3>
          <div className="flex items-baseline">
            <p className="text-[#1B0A3F] text-3xl font-bold tabular-nums transition-all duration-300">
              {formatValue(displayValue)}
            </p>
            {suffix && (
              <span className="text-[#BF4BF6] text-xl font-bold ml-1 transition-colors duration-200">
                {suffix}
              </span>
            )}
          </div>
          
          {/* ENTERPRISE: Subtle progress indicator for loading state */}
          {displayValue < value && value > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] rounded-full transition-all duration-75"
                style={{ width: `${(displayValue / value) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// ENTERPRISE: Main stats overview component with performance optimizations
const StatsOverview: React.FC<StatsOverviewProps> = React.memo(({ 
  totalCoursesOverall, 
  totalActiveLearnersOverall 
}) => {
  // ENTERPRISE: Memoized stat configurations
  const stats = React.useMemo(() => [
    {
      id: 'courses',
      icon: <Award size={24} className="text-white" />,
      label: 'Total Courses',
      value: totalCoursesOverall
    },
    {
      id: 'learners',
      icon: <CheckCircle2 size={24} className="text-white" />,
      label: 'Active Learners',
      value: totalActiveLearnersOverall
    }
  ], [totalCoursesOverall, totalActiveLearnersOverall]);

  // ENTERPRISE: Performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 StatsOverview rendered:', { totalCoursesOverall, totalActiveLearnersOverall });
    }
  }, [totalCoursesOverall, totalActiveLearnersOverall]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </div>
  );
});

StatsOverview.displayName = 'StatsOverview';

export default StatsOverview;