import React from 'react';
import PMNotificationItem from './PMnotificationItem';
import { NotificationGroupProps, Notification } from '../types/PMnotification';

const PMNotificationGroup: React.FC<NotificationGroupProps> = ({
  title,
  notifications,
  onMarkRead,
  onRemove,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h2 className="text-[#1B0A3F] font-semibold">{title}</h2>
    </div>
    <div className="space-y-3">
      {notifications.map((notification: Notification) => (
        <PMNotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onRemove={onRemove}
        />
      ))}
    </div>
  </div>
);

export default PMNotificationGroup;