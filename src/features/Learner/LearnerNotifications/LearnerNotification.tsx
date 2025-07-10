// Path: src/features/Learner/LearnerNotifications/LearnerNotification.tsx

import React, { useState } from 'react';
import { Bell, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import LearnerNotificationGroup from './Components/LearnerNotificationGroup';
import NotificationErrorBoundary from './Components/NotificationErrorBoundary';
import { LearnerNotification, NotificationGroup, NotificationStats } from './types/learnerNotification';
import { useNotifications } from '../../../contexts/NotificationContext';
import { toast } from 'react-hot-toast';

const LearnerNotifications: React.FC = () => {
  const { 
    notifications, 
    summary, 
    loading, 
    error, 
    refreshNotifications, 
    markAllAsRead 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'project_assignment' | 'project_update' | 'project_removal'>('all');

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.isRead) || 
      (filter === 'read' && notification.isRead);
    
    const matchesTypeFilter = 
      typeFilter === 'all' || 
      notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  // Group notifications by type
  const groupedNotifications: NotificationGroup[] = [
    {
      title: 'Project Assignments',
      notifications: filteredNotifications.filter(n => n.type === 'project_assignment'),
      icon: '🎯',
      color: 'bg-[#BF4BF6]'
    },
    {
      title: 'Project Updates',
      notifications: filteredNotifications.filter(n => n.type === 'project_update'),
      icon: '🔄',
      color: 'bg-[#52007C]'
    },
    {
      title: 'Project Removals',
      notifications: filteredNotifications.filter(n => n.type === 'project_removal'),
      icon: '❌',
      color: 'bg-[#34137C]'
    },
    {
      title: 'General',
      notifications: filteredNotifications.filter(n => n.type === 'general'),
      icon: '📢',
      color: 'bg-[#D68BF9]'
    }
  ].filter(group => group.notifications.length > 0);

  const stats: NotificationStats = {
    total: summary?.totalCount || 0,
    unread: summary?.unreadCount || 0,
    projectAssignments: notifications.filter(n => n.type === 'project_assignment').length,
    projectUpdates: notifications.filter(n => n.type === 'project_update').length,
    projectRemovals: notifications.filter(n => n.type === 'project_removal').length,
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNotifications();
      toast.success('Notifications refreshed');
    } catch (error) {
      toast.error('Failed to refresh notifications');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#BF4BF6]"></div>
          <p className="text-white ml-4 text-lg">Loading Notifications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 border border-[#BF4BF6]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] rounded-xl shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#1B0A3F]">Notifications</h1>
                  <p className="text-[#52007C]">Stay updated with your project assignments</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#52007C] to-[#34137C] hover:from-[#6B008F] hover:to-[#52007C] text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark All Read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards - Only Total, Unread, and Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Total</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.total}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] rounded-xl">
                  <Bell className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Unread</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.unread}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Assignments</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.projectAssignments}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-[#52007C] to-[#34137C] rounded-xl">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 border border-[#BF4BF6]/20">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-[#52007C]">Status:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#F6E6FF]/50 border border-[#BF4BF6]/30 rounded-lg text-[#52007C] focus:outline-none focus:border-[#BF4BF6] focus:ring-2 focus:ring-[#BF4BF6]/20"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-[#52007C]">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#F6E6FF]/50 border border-[#BF4BF6]/30 rounded-lg text-[#52007C] focus:outline-none focus:border-[#BF4BF6] focus:ring-2 focus:ring-[#BF4BF6]/20"
                >
                  <option value="all">All Types</option>
                  <option value="project_assignment">Project Assignments</option>
                  <option value="project_update">Project Updates</option>
                  <option value="project_removal">Project Removals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100/90 backdrop-blur-md border border-red-400/50 text-red-700 px-6 py-4 rounded-xl shadow-lg">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {/* Notifications */}
          {groupedNotifications.length > 0 ? (
            <NotificationErrorBoundary>
              <div className="space-y-6">
                {groupedNotifications.map((group, index) => (
                  <LearnerNotificationGroup
                    key={`${group.title}-${index}`}
                    group={group}
                  />
                ))}
              </div>
            </NotificationErrorBoundary>
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-[#BF4BF6]/20">
              <Bell className="h-16 w-16 text-[#BF4BF6] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1B0A3F] mb-2">No notifications found</h3>
              <p className="text-[#52007C]">
                {filter === 'unread' 
                  ? "You don't have any unread notifications" 
                  : typeFilter !== 'all'
                  ? `No ${typeFilter.replace('_', ' ')} notifications found`
                  : "You don't have any notifications yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LearnerNotifications;