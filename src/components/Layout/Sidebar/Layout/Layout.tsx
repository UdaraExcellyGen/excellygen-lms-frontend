// src/components/Layout.tsx
import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import SideBar from '../Sidebar/SideBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#52007C] to-[#1B0A3F]">
      <SideBar />
      <div 
        className={`
          flex-1 
          ${isCollapsed ? 'ml-20' : 'ml-72'} 
          transition-all 
          duration-500
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;