import apiClient from "../../apiClient";
import { DashboardStats, Notification } from "../../../features/Admin/AdminDashboard/types/types";

/**
 * Fetches dashboard statistics from the API
 * @returns Dashboard statistics including course categories, users, and technologies
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return empty stats if there's an error
    return {
      courseCategories: { total: 0, active: 0 },
      users: { total: 0, active: 0 },
      technologies: { total: 0, active: 0 }
    };
  }
};

/**
 * Fetches dashboard notifications from the API
 * @returns List of notifications
 */
export const getDashboardNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/admin/dashboard/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};