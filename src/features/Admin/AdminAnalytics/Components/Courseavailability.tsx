import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCourseAvailabilityAnalytics, ChartData } from '../../../../api/analyticsApi';

const COLOR = ['#52007C'];


const formatCategoryName = (name: string) => {
  if (name.length <= 15) return name;
  return name.substring(0, 13) + '...';
};

const CourseAvailability: React.FC = () => {
  const [data, setData] = useState<(ChartData & { originalName: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseAvailability();
  }, []);

  const fetchCourseAvailability = async () => {
    try {
      setLoading(true);
      const response = await getCourseAvailabilityAnalytics();
      
      const formattedData = (response.availabilityData || []).map((item, index) => ({
        ...item,
        originalName: item.name,
        name: formatCategoryName(item.name),
        color: COLOR[index % COLOR.length]
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

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-80">Loading course availability...</div>;
    if (error) return <div className="flex items-center justify-center h-80 text-red-500">{error}</div>;
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-80">No data available</div>;

    return (
        <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F6E6FF" />
            
            
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: "#1B0A3F" }} 
              interval={0} 
              angle={-45}
              textAnchor="end"
              label={{ value: 'Categories', position: 'insideBottom', dy: 60, fill: "#1B0A3F" }}
            />

            <YAxis 
              allowDecimals={false} 
              tick={{ fontSize: 12, fill: "#1B0A3F" }} 
              label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#1B0A3F" }} 
            />
            <Tooltip
              cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-[#BF4BF6]/20">
                      <p className="text-sm font-semibold text-[#1B0A3F]">{item.originalName}</p>
                      <p className="text-sm" style={{ color: item.color }}>
                        Courses: {item.value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#52007C'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6 text-[#1B0A3F]">Course Availability by Category</h2>
      {renderContent()}
    </div>
  );
};

export default CourseAvailability;