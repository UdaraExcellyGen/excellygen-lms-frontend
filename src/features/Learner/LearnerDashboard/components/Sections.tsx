// src/features/Learner/LearnerDashboard/components/Sections.tsx
// ENTERPRISE OPTIMIZED: Professional skeleton loading and instant responsiveness
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import {
  ActiveCoursesProps,
  RecentActivitiesProps,
  LearningActivityChartProps,
  DailyLearningTime
} from '../types/types';

// ENTERPRISE: Optimized custom bar component with proper SVG attributes
const CustomBar = React.memo((props: any) => {
  const { x, y, width, height, payload, isSelected } = props;

  // Render nothing for future days
  if (payload.totalMinutes === null) {
    return null; 
  }

  const isToday = payload.isToday;

  // Logic for PAST days: Dark if selected, light if not
  if (!isToday) {
    return (
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill={isSelected ? '#52007C' : '#BF4BF6'}
        rx="4"
        className="transition-all duration-300"
      />
    );
  }
  
  // Logic for TODAY'S bar: This structure creates the filling effect
  return (
    <g>
      {/* Layer 1: The static, light purple base "container" */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill="#CDB4DB"
        rx="4"
      />
      {/* Layer 2: The dark purple overlay with the "filling" animation */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill="#52007C" 
        rx="4"
        className="animate-liquid-fill"
      />
    </g>
  );
});

// ENTERPRISE: Professional skeleton components for instant loading
const CourseSkeleton: React.FC = React.memo(() => (
  <div className="bg-[#F6E6FF] rounded-xl p-4 animate-pulse">
    <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="relative mt-6">
      <div className="h-2 bg-gray-300 rounded-full"></div>
    </div>
  </div>
));

const ActivitySkeleton: React.FC = React.memo(() => (
  <div className="border-l-4 border-gray-200 pl-4 py-2 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
  </div>
));

const LearningActivitySkeleton: React.FC = React.memo(() => (
  <Card className="lg:col-span-3 animate-pulse">
    <CardHeader>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
    </CardHeader>
    <CardContent>
      <div className="h-56 mt-4 flex justify-around items-end">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className="w-8 bg-gray-200 rounded-t-md" 
            style={{ height: `${20 + (Math.random() * 60)}%` }}
          ></div>
        ))}
      </div>
    </CardContent>
  </Card>
));

// ENTERPRISE: Optimized empty state components
const EmptyCoursesState: React.FC = React.memo(() => (
  <div className="text-center py-8">
    <Book className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 text-sm">No active courses found.</p>
    <p className="text-xs text-gray-400 mt-1">Enroll in courses to see them here</p>
  </div>
));

const EmptyActivitiesState: React.FC = React.memo(() => (
  <div className="text-center py-8">
    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 text-sm">No recent activities to show.</p>
    <p className="text-xs text-gray-400 mt-1">Start learning to see your progress</p>
  </div>
));

// ENTERPRISE: Optimized ActiveCourses component with instant loading
export const ActiveCourses: React.FC<ActiveCoursesProps> = React.memo(({ courses, isLoading }) => {
  const navigate = useNavigate();
  
  const handleCourseClick = useCallback((courseId: number) => {
    navigate(`/learner/course-view/${courseId}`);
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, courseId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCourseClick(courseId);
    }
  }, [handleCourseClick]);

  // ENTERPRISE: Memoized course items for performance
  const courseItems = useMemo(() => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => <CourseSkeleton key={`skeleton-${index}`} />);
    }

    if (courses.length === 0) {
      return <EmptyCoursesState />;
    }

    return courses.map(course => (
      <div 
        key={course.id} 
        className="bg-[#F6E6FF] rounded-xl p-4 hover:bg-[#F0D6FF] transition-colors cursor-pointer group"
        onClick={() => handleCourseClick(course.id)}
        role="button" 
        tabIndex={0}
        onKeyDown={(e) => handleKeyDown(e, course.id)}
        aria-label={`View course: ${course.title}`}
      >
        <h3 className="font-medium text-[#1B0A3F] group-hover:text-[#52007C] transition-colors">
          {course.title}
        </h3>
        <div className="relative mt-6">
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#52007C] to-[#BF4BF6] transition-all duration-500 ease-out" 
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <span className="absolute right-0 -top-6 text-sm font-medium text-[#52007C] group-hover:text-[#34137C] transition-colors">
            {course.progress}%
          </span>
        </div>
      </div>
    ));
  }, [courses, isLoading, handleCourseClick, handleKeyDown]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#F6E6FF] group-hover:bg-[#E6D0FF] transition-colors">
            <Book className="text-[#BF4BF6]" />
          </div>
          Recent Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseItems}
        </div>
      </CardContent>
    </Card>
  );
});

// ENTERPRISE: Optimized RecentActivities component with instant loading
export const RecentActivities: React.FC<RecentActivitiesProps> = React.memo(({ activities, isLoading }) => {
  // ENTERPRISE: Memoized activity items for performance
  const activityItems = useMemo(() => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => <ActivitySkeleton key={`activity-skeleton-${index}`} />);
    }

    if (activities.length === 0) {
      return <EmptyActivitiesState />;
    }

    return activities.map(activity => (
      <div 
        key={activity.id} 
        className="border-l-4 border-[#BF4BF6] pl-4 py-2 hover:bg-[#F6E6FF]/50 rounded-r-lg transition-all duration-200 group"
      >
        <p className="font-medium text-[#1B0A3F] group-hover:text-[#52007C] transition-colors">
          {activity.type}
        </p>
        <p className="text-sm text-[#52007C] group-hover:text-[#34137C] transition-colors">
          {activity.course}
        </p>
        {activity.time && (
          <p className="text-xs text-[#7A00B8] group-hover:text-[#52007C] transition-colors">
            {activity.time}
          </p>
        )}
      </div>
    ));
  }, [activities, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#F6E6FF]">
            <Clock className="text-[#BF4BF6]" />
          </div>
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityItems}
        </div>
      </CardContent>
    </Card>
  );
});

// ENTERPRISE: Optimized LearningActivityChart with professional interactions
export const LearningActivityChart: React.FC<LearningActivityChartProps> = React.memo(({ data, isLoading }) => {
  const [selectedDay, setSelectedDay] = useState<DailyLearningTime | null>(null);

  // ENTERPRISE: Smart day selection effect
  useEffect(() => {
    const todayData = data.find(d => d.isToday);
    if (todayData) {
      setSelectedDay(todayData);
    } else if (data.length > 0) {
      const lastDataDay = [...data].reverse().find(d => d.totalMinutes !== null);
      setSelectedDay(lastDataDay || null);
    }
  }, [data]);

  // ENTERPRISE: Optimized time formatting
  const formatTime = useCallback((totalMinutes: number | null | undefined) => {
    if (totalMinutes === null || totalMinutes === undefined) return { hours: 0, minutes: 0 };
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }, []);
  
  // ENTERPRISE: Memoized chart calculations
  const chartConfig = useMemo(() => {
    const maxMinutes = Math.max(...data.map(d => d.totalMinutes || 0), 60);
    const maxHours = Math.ceil(maxMinutes / 60);
    const hourTicks = Array.from({ length: maxHours + 1 }, (_, i) => i * 60);
    
    return { maxMinutes, maxHours, hourTicks };
  }, [data]);

  // ENTERPRISE: Optimized chart click handler
  const handleChartClick = useCallback((chartState: any) => {
    if (chartState && chartState.activePayload && chartState.activePayload[0]) {
      const payload = chartState.activePayload[0].payload;
      if (payload.totalMinutes !== null) {
        setSelectedDay(payload);
      }
    }
  }, []);

  // ENTERPRISE: Optimized tooltip formatter
  const tooltipFormatter = useCallback((value: number, _name: string, props: any) => {
    if (props.payload.totalMinutes === null) return ["Future day", null];
    if (value === 0) return ["No activity recorded", null];
    const { hours, minutes } = formatTime(value);
    return [`${hours} hr ${minutes} min`, 'Screen time'];
  }, [formatTime]);

  // ENTERPRISE: Memoized custom bar renderer
  const customBarRenderer = useCallback((props: any) => (
    <CustomBar {...props} isSelected={selectedDay?.day === props.payload.day} />
  ), [selectedDay?.day]);

  const { hours: selectedHours, minutes: selectedMinutes } = formatTime(selectedDay?.totalMinutes);

  if (isLoading) {
    return <LearningActivitySkeleton />;
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#F6E6FF]">
            <BarChart2 className="text-[#BF4BF6]" />
          </div>
          Learner Screen Time
        </CardTitle>
        <div className="mt-4 pl-1">
          <p className="text-4xl font-bold text-[#1B0A3F] transition-all duration-300">
            {selectedHours}<span className="text-2xl font-normal text-gray-500"> hr</span> {selectedMinutes}<span className="text-2xl font-normal text-gray-500"> min</span>
          </p>
          <p className="text-md text-gray-500 h-5 transition-colors duration-300">
            {selectedDay?.fullDate || 'Select a day'}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }} 
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE0F5" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#7A00B8' }} 
                fontSize={12}
              />
              <YAxis 
                domain={[0, chartConfig.hourTicks[chartConfig.hourTicks.length - 1] || 60]}
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `${Number(value) / 60}`} 
                ticks={chartConfig.hourTicks} 
                tick={{ fill: '#7A00B8' }} 
                fontSize={12}
              />
              <Tooltip
                cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #EAE0F5', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={tooltipFormatter}
              />
              <Bar
                dataKey="totalMinutes"
                shape={customBarRenderer}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});