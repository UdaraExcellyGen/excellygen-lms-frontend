// Path: src/features/Learner/LearnerNotifications/Components/LearnerNotificationGroup.tsx

import React from 'react';
import LearnerNotificationItem from './LearnerNotificationItem';
import { NotificationGroup } from '../types/learnerNotification';

interface LearnerNotificationGroupProps {
  group: NotificationGroup;
}

const LearnerNotificationGroup: React.FC<LearnerNotificationGroupProps> = ({ group }) => {
  // Safety check - ensure group and group.notifications exist
  if (!group || !group.notifications || !Array.isArray(group.notifications)) {
    return null;
  }

  // Don't render if no notifications in this group
  if (group.notifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-[#BF4BF6]/20">
      {/* Group Header */}
      <div className={`${group.color} px-6 py-4`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{group.icon}</span>
          <div className="text-white">
            <h3 className="text-lg font-semibold">{group.title}</h3>
            <p className="text-sm opacity-90">
              {group.notifications.length} {group.notifications.length === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-[#BF4BF6]/10">
        {group.notifications.map((notification, index) => (
          <div key={notification.id || index} className="p-0">
            <LearnerNotificationItem notification={notification} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnerNotificationGroup;