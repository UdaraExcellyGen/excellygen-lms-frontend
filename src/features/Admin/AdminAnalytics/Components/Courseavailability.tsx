// src/features/admin/Analytics/Components/CourseAvailability.tsx
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCourseAvailabilityAnalytics } from '../../../../api/analyticsApi';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

// Helper function to format long category names to fit better horizontally
const formatCategoryName = (name: string) => {
  // For shorter names, just keep as is
  if (name.length <= 10) return name;
  
  // For longer names, abbreviate middle portion
  return name.substring(0, 8) + '...' + name.substring(name.length - 4);
};

const CourseAvailability: React.FC = () => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseAvailability();
  }, []);

  const fetchCourseAvailability = async () => {
    try {
      setLoading(true);
      const response = await getCourseAvailabilityAnalytics();
      
      // Format category names but keep original for tooltips
      const formattedData = (response.availabilityData || []).map(item => ({
        ...item,
        originalName: item.name, // Keep original name for tooltip
        name: formatCategoryName(item.name), // Format for display
        color: '#BF4BF6' // Update color to match theme
      }));
      
      setData(formattedData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading course availability data:', err);
      setError('Failed to load course availability data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading course availability data...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="p-6">No course availability data available</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6 text-[#1B0A3F]">Course Availability</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F6E6FF" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: "#1B0A3F" }}  // Updated font color
              interval={0}
              tickMargin={8}
              label={{ value: "Categories", position: "bottom", offset: 10, fill: "#1B0A3F" }}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#1B0A3F" }}
              tickMargin={10}
              label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#1B0A3F" }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }} // Updated cursor color
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-[#BF4BF6]/20">
                      <p className="text-sm font-semibold text-[#1B0A3F]">{data.originalName || data.name}</p>
                      <p className="text-sm text-[#BF4BF6]">
                        Courses: {data.value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" fill="#52007C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CourseAvailability;