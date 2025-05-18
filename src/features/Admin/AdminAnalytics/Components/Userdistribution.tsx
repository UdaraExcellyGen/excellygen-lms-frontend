// src/features/admin/Analytics/Components/UserDistribution.tsx
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserDistributionAnalytics } from '../../../../api/analyticsApi';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const UserDistribution: React.FC = () => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserDistribution();
  }, []);

  const fetchUserDistribution = async () => {
    try {
      setLoading(true);
      const response = await getUserDistributionAnalytics();
      setData(response.distributionData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading user distribution data:', err);
      setError('Failed to load user distribution data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl p-6">Loading user distribution data...</div>;
  if (error) return <div className="bg-white rounded-2xl p-6 text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="bg-white rounded-2xl p-6">No user distribution data available</div>;

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6">User Distribution</h2>
      <div className="h-64 relative">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex justify-center gap-6 z-10">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 40 }}>
            <Pie 
              data={data} 
              innerRadius={60} 
              outerRadius={80} 
              paddingAngle={5} 
              dataKey="value" 
              cy={120}
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color || '#ccc'} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                      <p className="text-sm font-semibold">{data.name}</p>
                      <p className="text-sm" style={{ color: data.color }}>
                        Count: {data.value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserDistribution;