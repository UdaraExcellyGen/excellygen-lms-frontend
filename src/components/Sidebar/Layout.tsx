import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './SideBar';
import { useSidebar } from '../Sidebar/contexts/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsCollapsed]);

  // Always return the gradient background
  const getBackgroundColor = () => {
    return 'bg-gradient-to-b from-[#52007C] to-[#34137C]';
  };

  return (
    <div className={`flex min-h-screen ${getBackgroundColor()}`}>
      <Sidebar />
      <main 
        className={`
          flex-1 
          w-full
          ${isMobile ? 'ml-0 px-2' : isCollapsed ? 'ml-20' : 'ml-72'} 
          transition-all 
          duration-500
          relative
        `}
      >
        <div className="w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;