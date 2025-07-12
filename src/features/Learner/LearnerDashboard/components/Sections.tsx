import React from 'react';
import { useNavigate } from 'react-router-dom'; // Removed unused Link import
import { Book, Clock, BarChart2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { 
  ActiveCoursesProps, 
  RecentActivitiesProps, 
  LearningActivityChartProps,
} from '../types/types';

export const ActiveCourses: React.FC<ActiveCoursesProps> = ({ courses }) => {
  const navigate = useNavigate();

  // Function to handle course click and navigation
  const handleCourseClick = (courseId: number) => {
    // Navigate to the course overview page using the course's actual ID
    navigate(`/learner/course-view/${courseId}`);
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#F6E6FF]">
              <Book className="text-[#BF4BF6]" />
            </div>
            Active Courses
          </CardTitle>
          {/* The "View All" link has been removed */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="bg-[#F6E6FF] rounded-xl p-4 hover:bg-[#F0D6FF] transition-colors cursor-pointer shadow-sm hover:shadow"
              onClick={() => handleCourseClick(course.id)} // Simplified onClick handler
              role="button"
              tabIndex={0}
              aria-label={`View ${course.title} course`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCourseClick(course.id); // Simplified onKeyDown handler
                }
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-[#1B0A3F]">{course.title}</h3>
              </div>
              <div className="relative">
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#52007C] to-[#BF4BF6] transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="absolute right-0 -top-6 text-sm font-medium text-[#52007C]">
                  {course.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => (
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
        {activities.map(activity => (
          <div key={activity.id} className="border-l-4 border-[#BF4BF6] pl-4 py-2 hover:bg-[#F6E6FF]/50 rounded-r-lg transition-colors">
            <p className="font-medium text-[#1B0A3F]">{activity.type}</p>
            <p className="text-sm text-[#52007C]">{activity.course}</p>
            {activity.time && <p className="text-xs text-[#7A00B8]">{activity.time}</p>}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const LearningActivityChart: React.FC<LearningActivityChartProps> = ({ data }) => (
  <Card className="lg:col-span-3">
    <CardHeader>
      <CardTitle className="text-[#1B0A3F] font-['Unbounded'] flex items-center gap-2">
        <div className="p-2 rounded-lg bg-[#F6E6FF]">
          <BarChart2 className="text-[#BF4BF6]" />
        </div>
        Learning Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F6E6FF" />
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#52007C' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#52007C' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid rgba(191, 75, 246, 0.2)',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}
            />
            <Bar 
              dataKey="hours" 
              fill="#52007C"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);