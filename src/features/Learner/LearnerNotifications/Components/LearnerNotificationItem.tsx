// Path: src/features/Learner/LearnerNotifications/Components/LearnerNotificationItem.tsx

import React, { useState } from 'react';
import { Clock, CheckCircle, Trash2, User, Briefcase, Percent, ChevronDown } from 'lucide-react';
import { LearnerNotification } from '../types/learnerNotification';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { toast } from 'react-hot-toast';

interface LearnerNotificationItemProps {
  notification: LearnerNotification;
}

const LearnerNotificationItem: React.FC<LearnerNotificationItemProps> = ({ notification }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { markAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = async () => {
    if (notification.isRead || isMarkingRead) return;
    
    setIsMarkingRead(true);
    try {
      await markAsRead(notification.id);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNotification(notification.id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'project_assignment':
        return '🎯';
      case 'project_update':
        return '🔄';
      case 'project_removal':
        return '❌';
      default:
        return '📢';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'project_assignment':
        return 'bg-[#F6E6FF] border-[#BF4BF6] text-[#52007C]';
      case 'project_update':
        return 'bg-[#E6F3FF] border-[#3B82F6] text-[#1D4ED8]';
      case 'project_removal':
        return 'bg-[#FEE2E2] border-[#EF4444] text-[#DC2626]';
      default:
        return 'bg-[#F3E8FF] border-[#8B5CF6] text-[#6D28D9]';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Check if notification has expandable content
  const hasExpandableContent = notification.projectName || notification.role || notification.workloadPercentage || notification.assignerName;

  return (
    <div className={`transition-all duration-300 hover:bg-[#F6E6FF]/30 ${
      notification.isRead 
        ? 'bg-[#F6E6FF]/20 opacity-75' 
        : 'bg-white/90 border-l-4 border-l-[#BF4BF6]'
    } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Main Content Area - Always Visible */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor()}`}>
              <span className="mr-1">{getTypeIcon()}</span>
              {notification.type.replace('_', ' ')}
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-[#BF4BF6] rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                disabled={isMarkingRead}
                className="p-1 text-[#52007C] hover:text-green-600 transition-colors disabled:opacity-50"
                title="Mark as read"
              >
                <CheckCircle className={`h-4 w-4 ${isMarkingRead ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-[#52007C] hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete notification"
            >
              <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Summary */}
        <div className="space-y-2">
          <h3 className={`font-semibold ${notification.isRead ? 'text-[#52007C]/70' : 'text-[#1B0A3F]'}`}>
            {notification.title}
          </h3>
          
          {/* Truncated message for collapsed state */}
          <p className={`text-sm ${notification.isRead ? 'text-[#52007C]/60' : 'text-[#52007C]'} ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {notification.message}
          </p>
        </div>

        {/* Expand/Collapse Button */}
        {hasExpandableContent && (
          <div className="mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-sm text-[#BF4BF6] hover:text-[#52007C] transition-colors"
            >
              <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        )}

        {/* Basic Footer - Always Visible */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#BF4BF6]/20">
          <div className="flex items-center space-x-2 text-xs text-[#52007C]/70">
            <Clock className="h-3 w-3" />
            <span>{formatDate(notification.createdAt)}</span>
          </div>
          
          {notification.isRead && (
            <span className="text-xs text-[#52007C]/50 flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Read</span>
            </span>
          )}
        </div>
      </div>

      {/* Expandable Content Area */}
      {hasExpandableContent && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4">
            <div className="bg-[#F6E6FF]/50 rounded-lg p-4 space-y-3 border border-[#BF4BF6]/20">
              <h4 className="text-sm font-semibold text-[#1B0A3F] mb-2">Project Details</h4>
              
              {notification.projectName && (
                <div className="flex items-center space-x-2 text-sm text-[#52007C]">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Project:</span>
                  <span className="break-words">{notification.projectName}</span>
                </div>
              )}
              
              {notification.role && (
                <div className="flex items-center space-x-2 text-sm text-[#52007C]">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Role:</span>
                  <span className="break-words">{notification.role}</span>
                </div>
              )}
              
              {notification.workloadPercentage && (
                <div className="flex items-center space-x-2 text-sm text-[#52007C]">
                  <Percent className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Workload:</span>
                  <span>{notification.workloadPercentage}%</span>
                </div>
              )}
              
              {notification.assignerName && (
                <div className="flex items-center space-x-2 text-sm text-[#52007C]">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Assigned by:</span>
                  <span className="break-words">{notification.assignerName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerNotificationItem;