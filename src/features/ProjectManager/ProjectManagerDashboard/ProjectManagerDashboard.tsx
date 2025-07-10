// Path: src/features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FolderKanban, 
  Users, 
  Settings,
  Loader,
  UserPlus,
  BarChart3,
  Cog
} from 'lucide-react';

// Import components
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';

// Import types
import { QuickAction, DashboardStats } from './types/types';

// Import the dashboard service (matching Admin pattern)
import { getDashboardStats, getDashboardNotifications } from '../../../api/services/ProjectManager/projectManagerDashboardService';

const ProjectManagerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // States for dashboard data (matching Admin pattern)
  const [stats, setStats] = useState<DashboardStats>({
    projects: { total: 0, active: 0 },
    employees: { total: 0, active: 0 },
    technologies: { total: 0, active: 0 }
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use memoized values for better performance (matching Admin)
  const quickActions: QuickAction[] = useMemo(() => [
    {
      text: t('projectManager.dashboard.projectManagementSystem'),
      icon: FolderKanban,
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      onClick: () => navigate('/project-manager/project-cruds')
    },
    {
      text: t('projectManager.dashboard.assignEmployees'),
      icon: UserPlus,
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      onClick: () => navigate('/project-manager/employee-assign')
    },
    {
      text: t('projectManager.dashboard.manageTechnologies'),
      icon: Cog,
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      onClick: () => navigate('/project-manager/project-cruds/technologies')
    },
    {
      text: t('projectManager.dashboard.manageRoles'),
      icon: BarChart3,
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      onClick: () => navigate('/project-manager/project-cruds/roles')
    }
  ], [navigate, t]);

  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }

    // Fetch dashboard data (matching Admin pattern)
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching Project Manager dashboard data...');
        
        // Fetch fresh data (matching Admin pattern)
        const [dashboardStats, notificationsData] = await Promise.all([
          getDashboardStats(),
          getDashboardNotifications()
        ]);
        
        console.log('Fresh PM data fetched:', dashboardStats);
        setStats(dashboardStats);
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error fetching Project Manager dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up refresh interval (matching Admin - every 5 minutes)
    const refreshInterval = setInterval(() => {
      const fetchFreshData = async () => {
        try {
          console.log('Fetching fresh PM data in background...');
          const [dashboardStats, notificationsData] = await Promise.all([
            getDashboardStats(),
            getDashboardNotifications()
          ]);
          
          console.log('Background PM fetch completed:', dashboardStats);
          setStats(dashboardStats);
          setNotifications(notificationsData);
        } catch (err) {
          console.error('Error updating PM dashboard data in background:', err);
          // Don't show error for background updates
        }
      };
      
      fetchFreshData();
    }, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Loading state (matching Admin styling exactly)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div className="text-xl">{t('projectManager.dashboard.loadingData')}</div>
        </div>
      </div>
    );
  }

  // Error state (matching Admin styling exactly)
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg text-red-700 px-6 py-4 max-w-lg">
          <p className="font-semibold text-lg mb-2 text-[#1B0A3F]">{t('projectManager.dashboard.errorLoading')}</p>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {t('projectManager.dashboard.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Header Section (matching Admin styling) */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg relative z-50">
          <Header
            notifications={notifications}
            adminName={currentUser?.name || "Project Manager"}
            role="Project Manager"
            avatar={currentUser?.avatar || null}
          />
        </div>

        {/* Stats Grid (matching Admin styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={FolderKanban}
              title={t('projectManager.dashboard.projectManagement')}
              stats={stats.projects}
              totalLabel={t('projectManager.dashboard.totalProjects')}
              activeLabel={t('projectManager.dashboard.activeProjects')}
              onClick={() => navigate('/project-manager/project-cruds')}
            />
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={Users}
              title={t('projectManager.dashboard.employeeManagement')}
              stats={stats.employees}
              totalLabel={t('projectManager.dashboard.totalEmployees')}
              activeLabel={t('projectManager.dashboard.activeEmployees')}
              onClick={() => navigate('/project-manager/employee-assign')}
            />
          </div>

          <div className="cursor-default [&>*]:cursor-default [&_*]:!cursor-default">
            <StatCard
              icon={Settings}
              title={t('projectManager.dashboard.technologyManagement')}
              stats={stats.technologies}
              totalLabel={t('projectManager.dashboard.totalTechnologies')}
              activeLabel={t('projectManager.dashboard.activeTechnologies')}
              onClick={() => navigate('/project-manager/project-cruds/technologies')}
            />
          </div>
        </div>

        {/* Quick Actions Section (matching Admin styling) */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-12 bg-[#BF4BF6] rounded-full"></div>
            <h2 className="text-white text-xl font-['Unbounded'] font-bold">{t('projectManager.dashboard.quickActions')}</h2>
          </div>

          {/* Quick Actions Grid */}
          <QuickActionsGrid actions={quickActions} />
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;