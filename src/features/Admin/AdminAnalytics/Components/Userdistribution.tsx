// src/features/admin/Analytics/Components/Userdistribution.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getUserDistributionAnalytics, UserDistributionItem } from '../../../../api/analyticsApi';

const COLORS = ['#52007C', '#BF4BF6', '#7A00B8', '#D68BF9', '#34137C'];

const UserDistribution: React.FC = () => {
  const [data, setData] = useState<UserDistributionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchUserDistribution();
  }, []);

  const chartData = useMemo(() => {
      return data.map(item => ({
          ...item,
          total: item.active + item.inactive
      }));
  }, [data]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-80">Loading user distribution...</div>;
    if (error) return <div className="flex items-center justify-center h-80 text-red-500">{error}</div>;
    if (!chartData || chartData.length === 0) return <div className="flex items-center justify-center h-80">No user data available</div>;

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            
            <PieChart margin={{ right: 40 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total"
                nameKey="role"
                labelLine={false}
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-[#BF4BF6]/20">
                            <p className="text-sm font-bold text-[#1B0A3F] mb-2">{item.role}: {item.total} Users</p>
                            <p className="text-xs text-green-600">Active: {item.active}</p>
                            <p className="text-xs text-red-600">Inactive: {item.inactive}</p>
                          </div>
                        );
                      }
                      return null;
                }}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-[#1B0A3F] uppercase bg-[#F6E6FF]">
              <tr>
                <th scope="col" className="px-4 py-2 rounded-l-lg">Role</th>
                <th scope="col" className="px-4 py-2 text-center">Active</th>
                <th scope="col" className="px-4 py-2 text-center">Inactive</th>
                <th scope="col" className="px-4 py-2 text-center rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.role} className="bg-white border-b border-gray-100">
                  <th scope="row" className="px-4 py-3 font-medium text-[#1B0A3F] whitespace-nowrap">{item.role}</th>
                  <td className="px-4 py-3 text-center">{item.active}</td>
                  <td className="px-4 py-3 text-center">{item.inactive}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-['Unbounded'] mb-6 text-[#1B0A3F]">User Distribution</h2>
      {renderContent()}
    </div>
  );
};

export default UserDistribution;