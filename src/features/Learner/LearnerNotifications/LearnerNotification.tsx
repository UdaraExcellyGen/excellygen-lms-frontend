import React, { useState } from 'react';
import { initialNotifications } from './data/mockData';
import { NotificationsState } from './types/learnerNotification';
import LearnerNotificationGroup from './Components/LearnerNotificationGroup';

const LearnerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationsState>(initialNotifications);

  const handleMarkRead = (notificationId: number) => {
    setNotifications(prev => {
      const newNotifications = { ...prev };
      Object.keys(newNotifications).forEach(timeframe => {
        newNotifications[timeframe as keyof NotificationsState] = newNotifications[timeframe as keyof NotificationsState].map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
      });
      return newNotifications;
    });
  };

  const handleRemove = (notificationId: number) => {
    setNotifications(prev => {
      const newNotifications = { ...prev };
      Object.keys(newNotifications).forEach(timeframe => {
        newNotifications[timeframe as keyof NotificationsState] = newNotifications[timeframe as keyof NotificationsState].filter(
          notification => notification.id !== notificationId
        );
      });
      return newNotifications;
    });
  };

  
  const handleClearAll = () => {
    setNotifications({
      today: [],
      yesterday: [],
      earlier: []
    });
  };

  const unreadCount = Object.values(notifications)
    .flat()
    .filter(n => !n.isRead)
    .length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto px-8 space-y-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-[#D68BF9] mt-1">Stay updated with your learning journey</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#1B0A3F] font-medium">All Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#F6E6FF] text-[#52007C] text-sm rounded-lg">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-sm text-gray-500 hover:text-[#BF4BF6] transition-colors"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(notifications).map(([timeframe, items]) => 
              items.length > 0 && (
                <div key={timeframe} className="bg-white p-6 rounded-xl shadow-lg">
                  <LearnerNotificationGroup
                    title={timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    notifications={items}
                    onMarkRead={handleMarkRead}
                    onRemove={handleRemove}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerNotifications;