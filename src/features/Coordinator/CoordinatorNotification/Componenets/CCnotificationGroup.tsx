import React from 'react';
import NotificationItem from './CCnotificationItem';
import { NotificationGroupProps } from '../types/CCNotification';

const NotificationGroup: React.FC<NotificationGroupProps> = ({
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
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onRemove={onRemove}
        />
      ))}
    </div>
  </div>
);

export default NotificationGroup;