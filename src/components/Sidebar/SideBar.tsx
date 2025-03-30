import React, { useRef, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  BookOpen,
  Award,
  BarChart2,
  Home,
  UserCircle,
  Search,
  MessageSquare,
  Bell,
  Trophy,
  LogOut,
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { useSidebar } from '../Sidebar/contexts/SidebarContext';
import { useSearch } from '../Sidebar/contexts/SearchContext';

interface MenuItem {
  title: string;
  icon: any;
  path: string;
  onClick?: () => void;
}

// Add custom scrollbar styles within the component
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1B0A3F;
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #BF4BF6;
    border-radius: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #D68BF9;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #BF4BF6 #1B0A3F;
  }
`;

const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Scroll to active item
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        // Scroll active element into view with padding
        activeElement.scrollIntoView({ 
          block: 'nearest',
          inline: 'start',
          behavior: 'smooth'
        });
      }
    }
  }, [location.pathname]);

  // Handle search navigation
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      navigate('/search-results');
    }
  }, [searchQuery, navigate]);

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  const handleMobileClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    clearSearch();
  };

  const learningMenuItems: MenuItem[] = [
    { title: 'Dashboard', icon: Home, path: '/learner/dashboard' },
    { title: 'Courses', icon: BookOpen, path: '/learner/course-categories' },
  ];

  const communityMenuItems: MenuItem[] = [
    { title: 'Discussion Forum', icon: MessageSquare, path: '/learner/forum' },
    { title: 'Projects', icon: Briefcase, path: '/learner/projects' },
    { title: 'Leaderboard', icon: BarChart2, path: '/learner/leaderboard' },
  ];

  const progressMenuItems: MenuItem[] = [
    { title: 'Certificates', icon: Award, path: '/learner/certificate' },
    { title: 'Badges & Rewards', icon: Trophy, path: '/learner/badges-rewards' },
    { title: 'Notifications', icon: Bell, path: '/learner/notifications' },
  ];

  const bottomMenuItems: MenuItem[] = [
    { title: 'Profile', icon: UserCircle, path: '/learner/profile' },
    { 
      title: 'Logout', 
      icon: LogOut, 
      path: '/',
      onClick: handleLogout 
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const renderMenuSection = (items: MenuItem[], title: string) => (
    <div className="mb-6">
      {!isCollapsed && (
        <p className="px-4 mb-2 text-xs font-semibold text-[#D68BF9] uppercase tracking-wider">
          {title}
        </p>
      )}
      {items.map((item, index) => {
        const isActive = isActivePath(item.path);
        return (
          <Link
            key={index}
            to={item.path}
            onClick={(e) => {
              if (item.onClick) item.onClick();
              handleMobileClick();
            }}
            data-active={isActive}
            className={`w-full flex items-center rounded-xl px-4 py-3 mb-2 
              transition-all duration-300 group
              ${isActive
                ? 'bg-gradient-to-r from-[#F6E6FF] to-[#F0D6FF] text-[#52007C]'
                : 'hover:bg-white/5 text-gray-300'}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon
              className={`h-5 w-5 transition-colors duration-300 ${
                isActive
                  ? 'text-[#52007C]'
                  : 'text-gray-400 group-hover:text-[#D68BF9]'
              }`}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className={`ml-3 text-sm font-medium transition-colors duration-300
                ${isActive
                  ? 'text-[#52007C]'
                  : 'text-gray-300 group-hover:text-[#D68BF9]'}`}>
                {item.title}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  // Mobile menu button that appears at the top left when on mobile
  const MobileMenuButton = () => (
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="fixed top-4 left-4 z-[200] md:hidden bg-[#1B0A3F] rounded-lg p-2 shadow-lg"
      aria-label="Toggle menu"
    >
      <Menu className="h-6 w-6 text-white" />
    </button>
  );

  return (
    <>
      {/* Include the custom scrollbar styles */}
      <style>{scrollbarStyles}</style>
      
      <MobileMenuButton />
      
      <div 
        className={`fixed top-0 left-0 h-full p-4 z-[100] transition-transform duration-500 ease-in-out
          ${isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div
          className={`h-screen bg-[#1B0A3F]/95 backdrop-blur-lg shadow-2xl 
            transition-all duration-500 ease-in-out
            relative flex flex-col rounded-[42px] border border-white/5
            ${isCollapsed ? 'w-20' : 'w-72'}`}
        >
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-12 bg-white shadow-lg rounded-full p-1.5 
              hover:bg-gray-50 transition-all duration-300 hover:scale-110 z-50 hidden md:block"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`h-4 w-4 text-gray-600 transition-transform duration-500 
                ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Logo Area */}
          <div className="flex-shrink-0 py-4">
            <Link to="/learner/dashboard" className="h-16 flex items-center px-6" aria-label="ExcellyGen Dashboard">
              {!isCollapsed ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] 
                    rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-white to-[#D68BF9] 
                    bg-clip-text text-transparent">ExcellyGen</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] 
                  rounded-xl flex items-center justify-center shadow-lg mx-auto">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
              )}
            </Link>

            {/* Search Bar */}
            <div className="px-4 mt-4 mb-4">
              <div className={`relative ${isCollapsed ? 'hidden' : 'block'}`}>
                <label htmlFor="sidebar-search" className="sr-only">Search Learners</label>
                <input
                  id="sidebar-search"
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search learners by ID or name..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10
                    focus:ring-2 focus:ring-[#BF4BF6] focus:ring-opacity-50 
                    placeholder-gray-400 text-white text-sm transition-all duration-300"
                />
                {searchQuery ? (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>

          {/* Main Navigation - Scrollable with fixed bottom area */}
          <div className="flex flex-col h-full overflow-hidden">
            {isCollapsed ? (
              // Collapsed view
              <div className="flex flex-col h-full">
                {/* Scrollable menu items with custom scrollbar class */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-4 custom-scrollbar"
                  role="navigation"
                >
                  <div className="flex flex-col space-y-4 py-2">
                    {[...learningMenuItems, ...progressMenuItems, ...communityMenuItems].map((item, index) => {
                      const isActive = isActivePath(item.path);
                      return (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={() => {
                            if (item.onClick) item.onClick();
                            handleMobileClick();
                          }}
                          data-active={isActive}
                          className={`flex items-center justify-center rounded-xl p-2.5
                            transition-all duration-300 group
                            ${isActive 
                              ? 'bg-gradient-to-r from-[#F6E6FF] to-[#F0D6FF]' 
                              : 'hover:bg-white/5'}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon 
                            className={`h-5 w-5 ${
                              isActive
                                ? 'text-[#52007C]'
                                : 'text-gray-400 group-hover:text-[#D68BF9]'
                            }`} 
                            aria-hidden="true"
                          />
                          <span className="sr-only">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                
                {/* Fixed bottom menu items */}
                <div className="mt-auto px-4 pb-6 pt-2 border-t border-white/10">
                  <div className="space-y-4">
                    {bottomMenuItems.map((item, index) => {
                      const isActive = isActivePath(item.path);
                      return (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={(e) => {
                            if (item.onClick) {
                              e.preventDefault();
                              item.onClick();
                            }
                            handleMobileClick();
                          }}
                          className={`flex items-center justify-center rounded-xl p-2.5
                            transition-all duration-300 group
                            ${isActive
                              ? 'bg-gradient-to-r from-[#F6E6FF] to-[#F0D6FF]'
                              : 'hover:bg-white/5'}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon 
                            className={`h-5 w-5 ${
                              isActive
                                ? 'text-[#52007C]'
                                : item.title === 'Logout' 
                                  ? 'text-red-400 group-hover:text-red-500'
                                  : 'text-gray-400 group-hover:text-[#D68BF9]'
                            }`} 
                            aria-hidden="true"
                          />
                          <span className="sr-only">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Expanded view
              <>
                {/* Scrollable menu sections with custom scrollbar class */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-4 custom-scrollbar"
                  role="navigation"
                >
                  {renderMenuSection(learningMenuItems, 'Learning')}
                  {renderMenuSection(progressMenuItems, 'Progress')}
                  {renderMenuSection(communityMenuItems, 'Community')}
                </div>
                
                {/* Fixed bottom menu */}
                <div className="mt-auto px-4 pb-6 pt-2 border-t border-white/10 flex-shrink-0">
                  {bottomMenuItems.map((item, index) => {
                    const isActive = isActivePath(item.path);
                    return (
                      <Link
                        key={index}
                        to={item.path}
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          }
                          handleMobileClick();
                        }}
                        className={`w-full flex items-center rounded-xl px-4 py-3 mb-2 
                          transition-all duration-300 group
                          ${isActive
                            ? 'bg-gradient-to-r from-[#F6E6FF] to-[#F0D6FF] text-[#52007C]'
                            : 'hover:bg-white/5 text-gray-300'}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon 
                          className={`h-5 w-5 ${
                            isActive
                              ? 'text-[#52007C]'
                              : item.title === 'Logout'
                                ? 'text-red-400 group-hover:text-red-500'
                                : 'text-gray-400 group-hover:text-[#D68BF9]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className={`ml-3 text-sm font-medium
                          ${isActive
                            ? 'text-[#52007C]'
                            : item.title === 'Logout'
                              ? 'text-red-400 group-hover:text-red-500'
                              : 'text-gray-300 group-hover:text-[#D68BF9]'}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[90]"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;