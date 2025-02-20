import React, { useState } from 'react';
import { 
  Bell,
  BookOpen,
  Award,
  MessageSquare,
  Calendar,
  Check,
  Clock,
  ChevronDown,
  X,
  Settings
} from 'lucide-react';
import Layout from '../../components/Layout';

interface Notification {
  id: number;
  type: 'course' | 'achievement' | 'discussion' | 'reminder';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
}

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onRemove: (id: number) => void;
}

interface NotificationsState {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead, onRemove }) => {
  const iconMap = {
    course: BookOpen,
    achievement: Award,
    discussion: MessageSquare,
    reminder: Calendar,
  };

  const Icon = iconMap[notification.type] || Bell;

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
          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
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

const NotificationGroup: React.FC<NotificationGroupProps> = ({ title, notifications, onMarkRead, onRemove }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h2 className="text-[#1B0A3F] font-semibold">{title}</h2>
      <button className="text-sm text-[#52007C] hover:text-[#BF4BF6] transition-colors">
        Mark all as read
      </button>
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

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationsState>({
    today: [
      {
        id: 1,
        type: 'course',
        title: 'New Quiz Available',
        message: 'A new quiz has been added to "Advanced React Development"',
        time: '2 hours ago',
        isRead: false
      },
      {
        id: 2,
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You ve earned the "React Master" badge',
        time: '4 hours ago',
        isRead: false
      }
    ],
    yesterday: [
      {
        id: 3,
        type: 'discussion',
        title: 'New Reply to Your Discussion',
        message: 'John Smith replied to your question about React hooks',
        time: '1 day ago',
        isRead: true
      },
      {
        id: 4,
        type: 'reminder',
        title: 'Course Deadline Approaching',
        message: 'The assignment for "Machine Learning Basics" is due in 2 days',
        time: '1 day ago',
        isRead: true
      }
    ],
    earlier: [
      {
        id: 5,
        type: 'course',
        title: 'Course Update',
        message: 'New content added to "Cloud Architecture" module',
        time: '3 days ago',
        isRead: true
      }
    ]
  });

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

  const unreadCount = Object.values(notifications)
    .flat()
    .filter(n => !n.isRead)
    .length;

  return (
    <Layout>
       <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto px-8 space-y-8">
          
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-[#D68BF9] mt-1">Stay updated with your learning journey</p>
              </div>
              <button
                onClick={() => {/* Navigate to notification settings */}}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Filter and Clear All */}
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
                  <button className="text-sm text-gray-500 hover:text-[#BF4BF6] transition-colors">
                    Clear all
                  </button>
                  <select className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer">
                    <option value="all">All types</option>
                    <option value="courses">Courses</option>
                    <option value="achievements">Achievements</option>
                    <option value="discussions">Discussions</option>
                    <option value="reminders">Reminders</option>
                  </select>
                </div>
              </div>

              {/* Notifications Groups */}
              <div className="space-y-8">
                {Object.entries(notifications).map(([timeframe, items]) => 
                  items.length > 0 && (
                    <div key={timeframe} className="bg-white p-6 rounded-xl shadow-lg">
                      <NotificationGroup
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
    </Layout>
  );
};

export default Notifications;