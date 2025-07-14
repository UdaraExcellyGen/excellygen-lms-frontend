import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { NotificationCardProps } from '../types/types';

const NotificationCard: React.FC<NotificationCardProps> = ({ notifications }) => {
    const navigate = useNavigate();
    const displayedNotifications = notifications.slice(0, 3);

    return (
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg p-6 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#F6E6FF]">
            <Bell size={24} className="text-[#BF4BF6]" />
          </div>
          <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">Recent Activity</h2>
        </div>
        
        <div className="space-y-3 flex-grow">
          {displayedNotifications.length > 0 ? (
            displayedNotifications.map((notification) => (
              <div key={notification.id} className="p-3 bg-[#F6E6FF]/60 rounded-lg cursor-pointer hover:bg-[#F6E6FF]">
                <p className="text-sm text-[#1B0A3F] font-['Nunito_Sans'] mb-1">{notification.text}</p>
                <p className="text-xs text-gray-500 font-['Nunito_Sans']">{notification.time}</p>
              </div>
            ))
          ) : (
              <div className="text-center text-gray-500 font-['Nunito_Sans'] h-full flex items-center justify-center">
                  No recent activity.
              </div>
          )}
        </div>
        
        {notifications.length > 3 && (
            <button 
                onClick={() => navigate('/coordinator/notifications')}
                className="w-full mt-6 py-2 px-4 bg-transparent border border-[#BF4BF6] text-[#BF4BF6] rounded-lg hover:bg-[#F6E6FF] transition-colors duration-300 font-nunito font-semibold text-sm"
            >
                View All
            </button>
        )}
      </div>
    );
};

export default NotificationCard;