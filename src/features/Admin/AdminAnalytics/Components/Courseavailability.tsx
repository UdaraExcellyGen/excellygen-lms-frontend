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
        name: formatCategoryName(item.name) // Format for display
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

  if (loading) return <div className="bg-white rounded-2xl p-6">Loading course availability data...</div>;
  if (error) return <div className="bg-white rounded-2xl p-6 text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="bg-white rounded-2xl p-6">No course availability data available</div>;

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6">Course Availability</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}  // Slightly smaller font
              interval={0}
              tickMargin={8}
              label={{ value: "Categories", position: "bottom", offset: 10 }}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              label={{ value: "Count", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(82, 0, 124, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                      <p className="text-sm font-semibold">{data.originalName || data.name}</p>
                      <p className="text-sm" style={{ color: data.color || '#52007C' }}>
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