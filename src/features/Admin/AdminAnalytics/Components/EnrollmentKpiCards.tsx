import React, { useState, useEffect } from 'react';
import { getEnrollmentKpis, EnrollmentKpiDto } from '../../../../api/analyticsApi';
import { Trophy, Star, CheckCircle } from 'lucide-react';


const KpiCard = ({ icon, title, value, subtitle, color }: { icon: React.ReactNode, title: string, value: string, subtitle: string, color: string }) => (
    
    <div className="bg-white/50 p-4 rounded-lg flex items-start gap-4 h-full">
        <div className={`rounded-lg p-3 flex-shrink-0`} style={{ backgroundColor: `${color}30` }}>
            {icon}
        </div>
        <div className="flex flex-col">
            <p className="text-sm text-gray-600">{title}</p>
            {/*  added `break-words` to allow wrapping */}
            <p className="text-lg font-bold text-[#1B0A3F] break-words" title={value}>
                {value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
    </div>
);


const EnrollmentKpiCards: React.FC = () => {
    const [kpis, setKpis] = useState<EnrollmentKpiDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKpis = async () => {
            try {
                setLoading(true);
                const data = await getEnrollmentKpis();
                setKpis(data);
            } catch (error) {
                console.error("Failed to load enrollment KPIs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchKpis();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        );
    }
    
    if (!kpis) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <KpiCard
                icon={<Trophy size={24} className="text-yellow-600" />}
                title="Most Popular Category"
                value={kpis.mostPopularCategoryName || 'N/A'}
                subtitle={`${kpis.mostPopularCategoryEnrollments.toLocaleString()} enrollments`}
                color="#FBBF24"
            />
            <KpiCard
                icon={<Star size={24} className="text-purple-600" />}
                title="Most Popular Course"
                value={kpis.mostPopularCourseName || 'N/A'}
                subtitle={`${kpis.mostPopularCourseEnrollments.toLocaleString()} enrollments`}
                color="#9333EA"
            />
            <KpiCard
                icon={<CheckCircle size={24} className="text-green-600" />}
                title="Most Completed Course"
                value={kpis.mostCompletedCourseName || 'N/A'}
                subtitle={`${kpis.mostCompletedCourseCount.toLocaleString()} completions`}
                color="#22C55E"
            />
        </div>
    );
};

export default EnrollmentKpiCards;