import React, { useState, useEffect } from 'react';
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

// THIS IS THE FINAL, RE-ENGINEERED CUSTOM BAR COMPONENT.
const CustomBar = (props: any) => {
    const { x, y, width, height, payload, isSelected } = props;

    // Render nothing for future days.
    if (payload.totalMinutes === null) {
        return null; 
    }

    const isToday = payload.isToday;

    // Logic for PAST days: Dark if selected, light if not.
    if (!isToday) {
        return (
            <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill={isSelected ? '#52007C' : '#CDB4DB'}
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300"
            />
        );
    }
    
    // Logic for TODAY'S bar: This structure creates the filling effect.
    return (
        <g>
            {/* Layer 1: The static, light purple base "container". */}
            <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill="#CDB4DB"
                radius={[4, 4, 0, 0]} 
            />
            {/* Layer 2: The dark purple overlay with the "filling" animation. */}
            <rect 
                x={x} 
                y={y} 
                width={width} 
                height={height} 
                fill="#52007C" 
                radius={[4, 4, 0, 0]} 
                className="animate-liquid-fill"
            />
        </g>
    );
};

const CourseSkeleton = () => (
  <div className="bg-[#F6E6FF] rounded-xl p-4 animate-pulse">
    <div className="h-5 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="relative mt-6"><div className="h-2 bg-gray-300 rounded-full"></div></div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="border-l-4 border-gray-200 pl-4 py-2 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
  </div>
);

const LearningActivitySkeleton = () => (
    <Card className="lg:col-span-3 animate-pulse">
        <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
            <div className="h-56 mt-4 flex justify-around items-end">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-8 bg-gray-200 rounded-t-md" style={{ height: `${20 + (Math.random() * 60)}%` }}></div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export const ActiveCourses: React.FC<ActiveCoursesProps> = ({ courses, isLoading }) => {
  const navigate = useNavigate();
  const handleCourseClick = (courseId: number) => navigate(`/learner/course-view/${courseId}`);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#F6E6FF]"><Book className="text-[#BF4BF6]" /></div>
          Active Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <><CourseSkeleton /><CourseSkeleton /><CourseSkeleton /></>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <div 
                key={course.id} 
                className="bg-[#F6E6FF] rounded-xl p-4 hover:bg-[#F0D6FF] transition-colors cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCourseClick(course.id); }}}
              >
                <h3 className="font-medium text-[#1B0A3F]">{course.title}</h3>
                <div className="relative mt-6">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#52007C] to-[#BF4BF6]" style={{ width: `${course.progress}%` }}/>
                  </div>
                  <span className="absolute right-0 -top-6 text-sm font-medium text-[#52007C]">{course.progress}%</span>
                </div>
              </div>
            ))
          ) : (<p className="text-center text-gray-500 py-4">No active courses found.</p>)}
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, isLoading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
        <div className="p-2 rounded-lg bg-[#F6E6FF]"><Clock className="text-[#BF4BF6]" /></div>
        Recent Activities
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {isLoading ? (
          <><ActivitySkeleton /><ActivitySkeleton /><ActivitySkeleton /></>
        ) : activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="border-l-4 border-[#BF4BF6] pl-4 py-2 hover:bg-[#F6E6FF]/50 rounded-r-lg">
              <p className="font-medium text-[#1B0A3F]">{activity.type}</p>
              <p className="text-sm text-[#52007C]">{activity.course}</p>
              {activity.time && <p className="text-xs text-[#7A00B8]">{activity.time}</p>}
            </div>
          ))
        ) : (<p className="text-center text-gray-500 py-4">No recent activities to show.</p>)}
      </div>
    </CardContent>
  </Card>
);

export const LearningActivityChart: React.FC<LearningActivityChartProps> = ({ data, isLoading }) => {
  const [selectedDay, setSelectedDay] = useState<DailyLearningTime | null>(null);

  useEffect(() => {
    const todayData = data.find(d => d.isToday);
    if (todayData) {
      setSelectedDay(todayData);
    } else if (data.length > 0) {
      const lastDataDay = [...data].reverse().find(d => d.totalMinutes !== null);
      setSelectedDay(lastDataDay || null);
    }
  }, [data]);

  const formatTime = (totalMinutes: number | null | undefined) => {
    if (totalMinutes === null || totalMinutes === undefined) return { hours: 0, minutes: 0 };
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };
  
  const { hours: selectedHours, minutes: selectedMinutes } = formatTime(selectedDay?.totalMinutes);

  if (isLoading) {
      return <LearningActivitySkeleton />;
  }

  const maxMinutes = Math.max(...data.map(d => d.totalMinutes || 0), 60);
  const maxHours = Math.ceil(maxMinutes / 60);
  const hourTicks = Array.from({ length: maxHours + 1 }, (_, i) => i * 60);

  return (
    <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#F6E6FF]"><BarChart2 className="text-[#BF4BF6]" /></div>
                Learning Activity
            </CardTitle>
             <div className="mt-4 pl-1">
                <p className="text-4xl font-bold text-[#1B0A3F]">
                    {selectedHours}<span className="text-2xl font-normal text-gray-500"> hr</span> {selectedMinutes}<span className="text-2xl font-normal text-gray-500"> min</span>
                </p>
                <p className="text-md text-gray-500 h-5">
                    {selectedDay?.fullDate || 'Select a day'}
                </p>
            </div>
        </CardHeader>
        <CardContent>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} onClick={(chartState) => {
                        if (chartState && chartState.activePayload && chartState.activePayload[0]) {
                            const payload = chartState.activePayload[0].payload;
                            if (payload.totalMinutes !== null) {
                                setSelectedDay(payload);
                            }
                        }
                    }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE0F5" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#7A00B8' }} fontSize={12}/>
                        <YAxis 
                            domain={[0, hourTicks[hourTicks.length - 1] || 60]}
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `${Number(value) / 60}`} 
                            ticks={hourTicks} 
                            tick={{ fill: '#7A00B8' }} 
                            fontSize={12}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #EAE0F5', borderRadius: '8px' }}
                            formatter={(value: number, name, props) => {
                                if (props.payload.totalMinutes === null) return ["Future day", null];
                                if (value === 0) return ["No activity recorded", null];
                                const { hours, minutes } = formatTime(value);
                                return [`${hours} hr ${minutes} min`, 'Screen time'];
                            }}
                        />
                        <Bar
                            dataKey="totalMinutes"
                            shape={(props) => (
                                <CustomBar {...props} isSelected={selectedDay?.day === props.payload.day}/>
                            )}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
  );
};