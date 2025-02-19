import React, { useState } from 'react';
import { Bell, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types/types';

interface HeaderProps {
  notifications: Notification[];
  coordinatorName?: string;
  role?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  notifications, 
  coordinatorName = "Coordinator Name",
  role = "Course Coordinator"
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/login');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[#BF4BF6] rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl text-[#1B0A3F] font-['Unbounded']">{coordinatorName}</h1>
            <p className="text-sm sm:text-base text-gray-400 font-['Nunito_Sans']">{role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:text-[#BF4BF6] transition-colors duration-200"
            >
              <Bell size={20} className="text-gray-500 hover:text-[#BF4BF6]" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#BF4BF6] rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-20">
                <h3 className="px-4 py-2 font-semibold text-[#1B0A3F] border-b font-['Unbounded']">Notifications</h3>
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="px-4 py-3 hover:bg-[#F6E6FF] cursor-pointer transition-colors duration-200"
                  >
                    <p className="text-sm text-[#1B0A3F] font-['Nunito_Sans']">{notif.text}</p>
                    <p className="text-xs text-gray-500 mt-1 font-['Nunito_Sans']">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-[#BF4BF6] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#F6E6FF]"
          >
            <LogOut size={20} />
            <span className="font-['Nunito_Sans'] hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;