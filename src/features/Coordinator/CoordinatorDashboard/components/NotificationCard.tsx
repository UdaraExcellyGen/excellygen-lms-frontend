import React from 'react';
import { Bell } from 'lucide-react';
import { NotificationCardProps } from '../types/types';

const NotificationCard: React.FC<NotificationCardProps> = ({ notifications }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 hover:shadow-md md:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-2 mb-6">
        <Bell size={24} className="text-[#BF4BF6]" />
        <h2 className="text-lg text-[#1B0A3F] font-['Unbounded']">Recent Notifications</h2>
      </div>
      
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div 
            key={index} 
            className="p-4 bg-[#F6E6FF] rounded-xl transform transition-all duration-300 hover:translate-x-2 hover:shadow-md cursor-pointer"
          >
            <p className="text-[#1B0A3F] font-['Nunito_Sans'] mb-1">{notification.text}</p>
            <p className="text-sm text-gray-500 font-['Nunito_Sans']">{notification.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;