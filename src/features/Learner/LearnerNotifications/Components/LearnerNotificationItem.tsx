// Path: src/features/Learner/LearnerNotifications/Components/LearnerNotificationItem.tsx

import React, { useState } from 'react';
import { Clock, CheckCircle, Trash2, User, Briefcase, Percent, ChevronDown, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
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

  const handleMarkAsRead = async () => { if (notification.isRead || isMarkingRead) return; setIsMarkingRead(true); 
    try
     { 
      await markAsRead(notification.id); toast.success('Notification marked as read');

      } 
    catch (error) { toast.error('Failed to mark notification as read'); } finally { setIsMarkingRead(false); } };
  const handleDelete = async () => { setIsDeleting(true); try { await deleteNotification(notification.id); toast.success('Notification deleted'); } catch (error) { toast.error('Failed to delete notification'); } finally { setIsDeleting(false); } };
  const getTypeIcon = () => { switch (notification.type) { case 'project_assignment': return '🎯'; case 'project_update': return '🔄'; case 'project_removal': return '❌'; default: return '🎁'; } };
  const getTypeColor = () => { switch (notification.type) { case 'project_assignment': return 'bg-[#F6E6FF] border-[#BF4BF6] text-[#52007C]'; case 'project_update': return 'bg-[#E6F3FF] border-[#3B82F6] text-[#1D4ED8]'; case 'project_removal': return 'bg-[#FEE2E2] border-[#EF4444] text-[#DC2626]'; default: return 'bg-amber-100 border-amber-400 text-amber-800'; } };

  // date formatting.
  const formatDate = (isoString: string) => {
    // The isoString from the server is now guaranteed to be in UTC format (e.g., "2023-07-27T09:17:00.12345Z")
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    
    const secondsIn = {
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
    };

    if (diffInSeconds < secondsIn.minute) {
      return "Just now";
    }
    if (diffInSeconds < secondsIn.hour) {
      const minutes = Math.floor(diffInSeconds / secondsIn.minute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < secondsIn.day) {
      const hours = Math.floor(diffInSeconds / secondsIn.hour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < secondsIn.week) {
      const days = Math.floor(diffInSeconds / secondsIn.day);
       if (days === 1) {
         return 'Yesterday';
       }
      return `${days} days ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasExpandableContent = notification.projectName || notification.role || notification.workloadPercentage || notification.assignerName;

  return (
    <div className={`
      transition-all duration-300 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border
      hover:shadow-xl 
      ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      ${notification.isRead
        ? 'bg-[#F6E6FF] border-[#D68BF9] hover:border-[#BF4BF6]'
        : 'bg-white border-[#BF4BF6] hover:border-[#A845E8]'
      }
    `}>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor()}`}>
              <span className="mr-1">{getTypeIcon()}</span>
              {notification.type === 'general' && notification.title === 'New Badge Unlocked!' ? 'Achievement' : notification.type.replace('_', ' ')}
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-[#BF4BF6] rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!notification.isRead && (
              <button onClick={handleMarkAsRead} disabled={isMarkingRead} className="p-1 text-[#52007C] hover:text-green-600 transition-colors disabled:opacity-50" title="Mark as read">
                <CheckCircle className={`h-4 w-4 ${isMarkingRead ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button onClick={handleDelete} disabled={isDeleting} className="p-1 text-[#52007C] hover:text-red-600 transition-colors disabled:opacity-50" title="Delete notification">
              <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className={`font-semibold ${notification.isRead ? 'text-[#52007C]/90' : 'text-[#1B0A3F]'}`}>{notification.title}</h3>
          <p className={`text-sm ${notification.isRead ? 'text-[#52007C]/80' : 'text-[#52007C]'} ${!isExpanded ? 'line-clamp-2' : ''}`}>{notification.message}</p>
        </div>

        {notification.title === "New Badge Unlocked!" && (
          <div className="mt-4">
            <Link to="/learner/badges-rewards" className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Gift className="h-4 w-4" />
              <span>Claim Badge</span>
            </Link>
          </div>
        )}

        {hasExpandableContent && (
          <div className="mt-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center space-x-2 text-sm text-[#BF4BF6] hover:text-[#52007C] transition-colors">
              <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-t-[#BF4BF6]/20">
          <div className="flex items-center space-x-2 text-xs text-[#52007C]/70">
            <Clock className="h-3 w-3" />
            <span>{formatDate(notification.createdAt)}</span>
          </div>
          {notification.isRead && (<span className="text-xs text-[#52007C]/50 flex items-center space-x-1"><CheckCircle className="h-3 w-3" /><span>Read</span></span>)}
        </div>
      </div>

      {hasExpandableContent && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4">
            <div className={`rounded-lg p-4 space-y-3 border border-[#BF4BF6]/20 ${notification.isRead ? 'bg-[#EAD4FF]' : 'bg-[#F6E6FF]/50'}`}>
              <h4 className="text-sm font-semibold text-[#1B0A3F] mb-2">Project Details</h4>
              {notification.projectName && (<div className="flex items-center space-x-2 text-sm text-[#52007C]"><Briefcase className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Project:</span><span className="break-words">{notification.projectName}</span></div>)}
              {notification.role && (<div className="flex items-center space-x-2 text-sm text-[#52007C]"><User className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Role:</span><span className="break-words">{notification.role}</span></div>)}
              {notification.workloadPercentage && (<div className="flex items-center space-x-2 text-sm text-[#52007C]"><Percent className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Workload:</span><span>{notification.workloadPercentage}%</span></div>)}
              {notification.assignerName && (<div className="flex items-center space-x-2 text-sm text-[#52007C]"><User className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Assigned by:</span><span className="break-words">{notification.assignerName}</span></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerNotificationItem;