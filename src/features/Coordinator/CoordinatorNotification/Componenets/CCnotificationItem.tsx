import React from 'react';
import { 
  Bell, BookOpen, MessageSquare, Calendar, 
  Check, Clock, X, PlusCircle, ExternalLink 
} from 'lucide-react';

import { NotificationItemProps } from '../types/CCNotification';

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onRemove,
}) => {
  const iconMap = {
    course: BookOpen,
    discussion: MessageSquare,
    enrollment: PlusCircle,
    deletion: ExternalLink,
    Project: Calendar,
  };

  const Icon = iconMap[notification.type] || Bell;


  const renderActionButton = () => {
    switch (notification.type) {
      case 'deletion':
        return null;
    
      case 'enrollment':
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 ${notification.isRead ? 'bg-white' : 'bg-[#F6E6FF]'} rounded-xl transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${notification.isRead ? 'bg-gray-100' : 'bg-[#BF4BF6]'}`}>
          <Icon className={`h-5 w-5 ${notification.isRead ? 'text-gray-600' : 'text-white'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-[#1B0A3F]'}`}>
            {notification.title}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
            {renderActionButton()}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {notification.time}
            </span>
            {!notification.isRead && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="text-xs text-[#52007C] hover:text-[#BF4BF6] flex items-center gap-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark as read
              </button>
            )}
            <button
              onClick={() => onRemove(notification.id)}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors ml-auto"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;