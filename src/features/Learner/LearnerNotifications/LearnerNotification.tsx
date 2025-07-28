// Path: src/features/Learner/LearnerNotifications/LearnerNotification.tsx

import React from 'react';
import { Bell, CheckCircle, Mail, RefreshCw, Briefcase, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import LearnerNotificationItem from './Components/LearnerNotificationItem';
import NotificationErrorBoundary from './Components/NotificationErrorBoundary';
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
  
  const navigate = useNavigate();

  const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'project_assignment' | 'project_update' | 'project_removal' | 'general'>('all');

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

  // Stats calculation
  const stats = {
    total: summary?.totalCount || 0,
    unread: summary?.unreadCount || 0,
    projects: notifications.filter(n => 
      ['project_assignment', 'project_update', 'project_removal'].includes(n.type)
    ).length,
    learnings: notifications.filter(n => n.type === 'general').length,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
              <p className="text-white/80 mt-1">Stay updated with your projects and learnings.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Total Notifications</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.total}</p>
                </div>
                <div className="p-3 bg-[#F6E6FF] rounded-xl"><Bell className="h-8 w-8 text-[#52007C]" /></div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-red-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Unread</p>
                  <p className="text-3xl font-bold text-red-700">{stats.unread}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl"><Mail className="h-8 w-8 text-red-600" /></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Projects</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.projects}</p>
                </div>
                <div className="p-3 bg-[#F6E6FF] rounded-xl"><Briefcase className="h-8 w-8 text-[#52007C]" /></div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 shadow-lg border border-[#BF4BF6]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#52007C] font-medium">Learnings</p>
                  <p className="text-3xl font-bold text-[#1B0A3F]">{stats.learnings}</p>
                </div>
                <div className="p-3 bg-[#F6E6FF] rounded-xl"><BookOpen className="h-8 w-8 text-[#52007C]" /></div>
              </div>
            </div>
          </div>

          {/* Filters & Actions Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4 border border-[#BF4BF6]/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-[#52007C]">Status:</label>
                  <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-[#52007C] focus:outline-none focus:border-[#BF4BF6] focus:ring-1 focus:ring-[#BF4BF6]">
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-[#52007C]">Type:</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-[#52007C] focus:outline-none focus:border-[#BF4BF6] focus:ring-1 focus:ring-[#BF4BF6]">
                    <option value="all">All Types</option>
                    <option value="project_assignment">Project Assignments</option>
                    <option value="project_update">Project Updates</option>
                    <option value="general">Learnings</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-[#52007C] rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark All Read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100/90 backdrop-blur-md border border-red-400/50 text-red-700 px-6 py-4 rounded-xl shadow-lg">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {/* Notifications List */}
          <NotificationErrorBoundary>
            {filteredNotifications.length > 0 ? (
             
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <LearnerNotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-12 text-center border border-[#BF4BF6]/20">
                <Bell className="h-16 w-16 text-[#BF4BF6] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#1B0A3F] mb-2">No Notifications Found</h3>
                <p className="text-[#52007C]">
                  {notifications.length === 0 
                    ? "You don't have any notifications yet." 
                    : "No notifications match your current filters."}
                </p>
              </div>
            )}
          </NotificationErrorBoundary>
        </div>
      </div>
    </Layout>
  );
};

export default LearnerNotifications;