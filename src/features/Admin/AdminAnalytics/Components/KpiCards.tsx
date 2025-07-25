import React, { useState, useEffect } from 'react';
import { getKpiSummary, KpiSummaryDto } from '../../../../api/analyticsApi';
import { Users, BookOpen, BarChart3, Target } from 'lucide-react';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-start gap-4" style={{ borderLeft: `4px solid ${color}` }}>
    <div className={`rounded-full p-2`} style={{ backgroundColor: `${color}20` }}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-[#1B0A3F]">{value}</p>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  </div>
);

const KpiCards: React.FC = () => {
  const [summary, setSummary] = useState<KpiSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getKpiSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load KPI summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
    </div>;
  }

  if (!summary) {
    return <div className="text-center text-red-500 py-4">Failed to load performance metrics.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard 
        icon={<Users size={24} className="text-[#BF4BF6]" />} 
        title="Total Learners" 
        value={summary.totalUsers.toLocaleString()} 
        subtitle={`${summary.activeUsers} active`}
        color="#BF4BF6"
      />
      <KpiCard 
        icon={<BookOpen size={24} className="text-[#52007C]" />} 
        title="Total Courses" 
        value={summary.totalCourses.toLocaleString()} 
        subtitle="Across all categories"
        color="#BF4BF6"
      />
      <KpiCard 
        icon={<BarChart3 size={24} className="text-[#A063C8]" />} 
        title="Total Enrollments" 
        value={summary.totalEnrollments.toLocaleString()} 
        subtitle={`${summary.completedEnrollments} completed`}
        color="#BF4BF6"
      />
      <KpiCard 
        icon={<Target size={24} className="text-[#D68BF9]" />} 
        title="Completion Rate" 
        value={`${summary.completionRate.toFixed(1)}%`} 
        subtitle="Of all enrollments"
        color="#BF4BF6"
      />
    </div>
  );
};

export default KpiCards;