import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Clock, Trophy, BarChart2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
  RecentAchievementsProps 
} from '../types/types';

export const ActiveCourses: React.FC<ActiveCoursesProps> = ({ courses }) => (
  <Card className="lg:col-span-2">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-[#1B0A3F] font-unbounded flex items-center gap-2">
          <Book className="text-[#BF4BF6]" />
          Active Courses
        </CardTitle>
        <Link to="/courses" className="text-sm text-[#52007C] hover:text-[#BF4BF6] transition-colors">
          View All
        </Link>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-[#F6E6FF] rounded-xl p-4 hover:bg-[#F0D6FF] transition-colors">
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

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-[#1B0A3F] font-unbounded flex items-center gap-2">
        <Clock className="text-[#BF4BF6]" />
        Recent Activities
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="border-l-4 border-[#BF4BF6] pl-4 py-2">
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
      <CardTitle className="text-[#1B0A3F] font-unbounded flex items-center gap-2">
        <Clock className="text-[#BF4BF6]" />
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
                backgroundColor: '#F6E6FF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="hours" 
              fill="url(#colorGradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BF4BF6" />
                <stop offset="100%" stopColor="#52007C" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);