import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, Clock, BarChart2 } from 'lucide-react'; // Removed Trophy
import { 
  // Removed LineChart, Line
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
  // Removed RecentAchievementsProps
} from '../types/types';

export const ActiveCourses: React.FC<ActiveCoursesProps> = ({ courses }) => {
  const navigate = useNavigate();

  // Function to handle course click and navigation
  const handleCourseClick = (courseId: number) => { // Added type for courseId
    // Navigate to the course overview page
    navigate(`/course/${courseId}`);
  };

  // Function to determine the course ID based on course title
  const getCourseId = (title: string): number => { // Added type for title and return type
    // Map course titles to IDs
    const courseIdMap: Record<string, number> = { // Added explicit type for courseIdMap
      "Web Development Fundamentals": 4,
      "Machine Learning Fundamentals": 2,
      "Cloud Architecture": 3
    };
    
    return courseIdMap[title] || 1; // Default to 1 if title not found
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
          <Link to="/active-courses" className="text-sm text-[#52007C] hover:text-[#BF4BF6] transition-colors">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="bg-[#F6E6FF] rounded-xl p-4 hover:bg-[#F0D6FF] transition-colors cursor-pointer shadow-sm hover:shadow"
              onClick={() => handleCourseClick(getCourseId(course.title))}
              role="button"
              tabIndex={0}
              aria-label={`View ${course.title} course`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCourseClick(getCourseId(course.title));
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