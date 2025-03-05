// src/components/Layout.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/SideBar';
import { useSidebar } from '../contexts/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  const getBackgroundColor = () => {
    // Check for course learning pattern (/course/{id}/learn)
    if (location.pathname.match(/^\/course\/\d+\/learn$/)) {
      return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
    }
  
    // Check for course title pattern (/courses/{any title})
    if (location.pathname.match(/^\/courses\/[^/]+$/)) {
      return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
    }

    if (location.pathname.match(/^\/certificate\/[^/]+$/)) {
      return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
    }
  
    // Handle other specific routes
    switch (location.pathname) {
      case '/settings':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/learner/dashboard':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/courses':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/forum':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/leaderboard':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/certificate':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/notifications':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/profile':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/analytics':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/badges-rewards':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/learner-projects':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      case '/cv':
        return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
      default:
        return 'bg-[#52007C]';
    }
  };

  return (
    <div className={`flex min-h-screen ${getBackgroundColor()}`}>
      <Sidebar />
      <main 
        className={`
          flex-1 
          ${isCollapsed ? 'ml-20' : 'ml-72'} 
          transition-all 
          duration-500
          relative
        `}
      >
        <div className="relative">{children}</div>
      </main>
    </div>
  );
};

export default Layout;