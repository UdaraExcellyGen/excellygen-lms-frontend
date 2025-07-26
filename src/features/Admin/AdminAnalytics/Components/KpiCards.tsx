import React, { useState, useEffect } from 'react';
import { getKpiSummary, KpiSummaryDto } from '../../../../api/analyticsApi';
import { Users, BookOpen, BarChart3, Target } from 'lucide-react';

interface KpiCardProps {

  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
    <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-[#1B0A3F]">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
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
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-white/20 rounded-xl animate-pulse"></div>
        ))}
    </div>;
  }

  if (!summary) {
    return <div className="text-center text-red-300 py-4 bg-red-500/10 rounded-lg">Failed to load performance metrics.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard 
        icon={Users} 
        title="Total Learners" 
        value={summary.totalUsers.toLocaleString()} 
        subtitle={`${summary.activeUsers} active`}
      />
      <KpiCard 
        icon={BookOpen}
        title="Total Courses" 
        value={summary.totalCourses.toLocaleString()} 
        subtitle="Across all categories"
      />
      <KpiCard 
        icon={BarChart3}
        title="Total Enrollments" 
        value={summary.totalEnrollments.toLocaleString()} 
        subtitle={`${summary.completedEnrollments} completed`}
      />
      <KpiCard 
        icon={Target}
        title="Completion Rate" 
        value={`${summary.completionRate.toFixed(1)}%`} 
        subtitle="Of all enrollments"
      />
    </div>
  );
};

export default KpiCards;