import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Users, Settings } from 'lucide-react';

// Import components
import Header from './components/Header';
import StatCard from './components/StatCard';
import QuickActionsGrid from './components/QuickActionsGrid';

// Import types
import { QuickAction } from './types/types';

const ProjectManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);

  // Notifications data
  const notifications = [
    {
      id: 1,
      text: "New project 'Website Redesign' has been created",
      time: "2 hours ago",
      isNew: true
    },
    {
      id: 2,
      text: "Mobile App Development deadline in 3 days",
      time: "5 hours ago",
      isNew: true
    },
    {
      id: 3,
      text: "Employee request for Database Optimization project",
      time: "1 day ago",
      isNew: false
    }
  ];

  // Stats data
  const stats = {
    projects: {
      total: 45,
      active: 28
    },
    employees: {
      total: 1250,
      active: 890
    },
    technologies: {
      total: 25,
      active: 20
    }
  };

  // Quick actions - navigation paths updated to match file structure
  const quickActions: QuickAction[] = [
    {
      text: "Manage Projects",
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
      onClick: () => navigate('/project-manager/projects') // Updated path
    },
    {
      text: "Assign Employees",
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
      onClick: () => navigate('/project-manager/employee-assign') // Updated path to match your file structure
    },
    {
      text: "Manage Technologies",
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
      onClick: () => navigate('/project-manager/technologies') // Updated path
    },
    {
      text: "Manage Roles",
      color: 'bg-gradient-to-r from-[#34137C] to-[#03045e]',
      hoverColor: 'hover:scale-105 hover:shadow-lg hover:bg-[#34137C] hover:bg-none',
      onClick: () => navigate('/project-manager/roles') // Updated path
    }
  ];

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <Header
        notifications={notifications}
        adminName={currentUser?.name || "Project Manager"}
        role="Project Manager"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <StatCard
          icon={FolderKanban}
          title="Project Management"
          stats={stats.projects}
          totalLabel="Total Projects"
          activeLabel="Active Projects"
          onViewMore={() => navigate('/project-manager/projects')}
        />

        <StatCard
          icon={Users}
          title="Employee Management"
          stats={stats.employees}
          totalLabel="Total Employees"
          activeLabel="Active Employees"
          onViewMore={() => navigate('/project-manager/employee-assign')}
        />

        <StatCard
          icon={Settings}
          title="Technology Management"
          stats={stats.technologies}
          totalLabel="Total Technologies"
          activeLabel="Active Technologies"
          onViewMore={() => navigate('/project-manager/technologies')}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid
        actions={quickActions}
      />
    </div>
  );
};

export default ProjectManagerDashboard;