import React from 'react';
import AdminNotificationItem from './NotificationItem';
import { NotificationGroupProps } from '../types/AdminNotification';

const AdminNotificationGroup: React.FC<NotificationGroupProps> = ({
  title,
  notifications,
  onMarkRead,
  onRemove,
  onDeleteCourse,
  onOpenDeleteModal
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h2 className="text-[#1B0A3F] font-semibold">{title}</h2>
    </div>
    <div className="space-y-3">
      {notifications.map(notification => (
        <AdminNotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onRemove={onRemove}
          onDeleteCourse={onDeleteCourse}
          onOpenDeleteModal={onOpenDeleteModal}
        />
      ))}
    </div>
  </div>
);

export default AdminNotificationGroup;