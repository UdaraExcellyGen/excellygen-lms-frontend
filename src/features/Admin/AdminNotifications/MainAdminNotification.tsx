import React, { useState, useEffect } from 'react';
import AdminNotificationGroup from './Components/NotificationGroup';
import AdminPopup from './Components/NotificationPopup';
import { NotificationsState, Notification } from './types/AdminNotification';
import { initialNotifications, generateInitialMessages } from './data/mockData';

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationsState>(initialNotifications);

  
  const [messages, setMessages] = useState<{ [key: number]: string }>({});
  

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    notification: Notification | null;
  }>({
    isOpen: false,
    notification: null,
  });

  useEffect(() => {
    setMessages(generateInitialMessages(notifications));
  }, [notifications]);  

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

  const handleDeleteCourse = (notificationId: number) => {
    setNotifications(prev => {
      const newNotifications = { ...prev };
      Object.keys(newNotifications).forEach(timeframe => {
        newNotifications[timeframe as keyof NotificationsState] = newNotifications[timeframe as keyof NotificationsState].map(notification =>
          notification.id === notificationId
            ? { ...notification, deletionStatus: 'deleted' }
            : notification
        );
      });
      return newNotifications;
    });
    console.log(`Course deleted for notification ID: ${notificationId}`);
  };

  const handleClearAll = () => {
    setNotifications({
      today: [],
      yesterday: [],
      earlier: []
    });
    setMessages({}); 
  };

 
  const handleOpenDeleteModal = (notification: Notification) => {
    setDeleteModal({
      isOpen: true,
      notification,
    });
  };

 
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      notification: null,
    });
  };

  
  const handleConfirmDelete = () => {
    if (deleteModal.notification) {
      handleDeleteCourse(deleteModal.notification.id);
      handleCloseDeleteModal();
    }
  };

  const unreadCount = Object.values(notifications)
    .flat()
    .filter(n => !n.isRead)
    .length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      
      <AdminPopup 
        isOpen={deleteModal.isOpen}
        notification={deleteModal.notification}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />

      <div className="max-w-7xl mx-auto px-8 space-y-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-[#D68BF9] mt-1">Stay updated with course deletion requests</p>
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
                  <AdminNotificationGroup
                    title={timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    notifications={items.map((notification: Notification) => ({
                      ...notification,
                      message: messages[notification.id] || '',  
                    }))}
                    onMarkRead={handleMarkRead}
                    onRemove={handleRemove}
                    onDeleteCourse={handleDeleteCourse}
                    onOpenDeleteModal={handleOpenDeleteModal}
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

export default AdminNotifications;