// src/features/admin/Analytics/Components/Userdistribution.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getUserDistributionAnalytics, UserDistributionItem } from '../../../../api/analyticsApi';

// --- START: NEW COLOR & FORMATTING LOGIC ---

// Function to get a specific brand color for each role
const getRoleColor = (role: string): string => {
  const lowerCaseRole = role.toLowerCase();
  
  if (lowerCaseRole.includes('super')) return '#03045e';      // Federal Blue
  if (lowerCaseRole.includes('admin')) return '#52007C';     // Indigo
  if (lowerCaseRole.includes('project')) return '#34137C';   // Persian Indigo
  if (lowerCaseRole.includes('course')) return '#0609C6';    // Medium Blue
  if (lowerCaseRole.includes('learner')) return '#BF4BF6';   // Phlox
  
  return '#586574'; // Payne's Gray as a fallback
};

// Function to format role names for display
const formatRoleName = (role: string): string => {
    if (role === 'CourseCoordinator') return 'Course Coordinator';
    if (role === 'ProjectManager') return 'Project Manager';
    if (role === 'SuperAdmin') return 'Super Admin';
    return role;
};

// --- END: NEW COLOR & FORMATTING LOGIC ---


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
          total: item.active + item.inactive,
          // Add formatted name for display in table and legend
          displayName: formatRoleName(item.role)
      }));
  }, [data]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-80">Loading user distribution...</div>;
    if (error) return <div className="flex items-center justify-center h-80 text-red-500">{error}</div>;
    if (!chartData || chartData.length === 0) return <div className="flex items-center justify-center h-80">No user data available</div>;

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-center">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total"
                nameKey="displayName" // Use the formatted name
                labelLine={false}
              >
                {/* Apply colors based on role name */}
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.role}`} fill={getRoleColor(entry.role)} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-lg border border-[#BF4BF6]/20">
                            <p className="text-sm font-bold text-[#1B0A3F] mb-2">{item.displayName}: {item.total} Users</p>
                            <p className="text-xs text-green-600">Active: {item.active}</p>
                            <p className="text-xs text-gray-500">Inactive: {item.inactive}</p>
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
                  <th scope="row" className="px-4 py-3 font-medium text-[#1B0A3F] whitespace-nowrap">{item.displayName}</th>
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