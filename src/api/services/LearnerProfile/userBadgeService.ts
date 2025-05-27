import apiClient from "../../apiClient";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  imageUrl: string;
  earnedDate?: Date;
}

export interface BadgeSummary {
  totalBadges: number;
  thisMonth: number;
  recentBadges: Badge[];
}

export interface UserBadge {
  id: number;
  badgeId: string;
  badgeName: string;
  badgeDescription?: string;
  badgeImageUrl?: string;
  badgeColor?: string;
  badgeIcon?: string;
  earnedDate: string;
  isRead: boolean;
}

// Get all badges for a user
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const response = await apiClient.get(`/user-badges/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
};

// Get badge summary for a user
export const getUserBadgeSummary = async (userId: string): Promise<BadgeSummary> => {
  try {
    const response = await apiClient.get(`/user-badges/${userId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user badge summary:', error);
    throw error;
  }
};

// Mark badge as read
export const markBadgeAsRead = async (userId: string, badgeId: number): Promise<void> => {
  try {
    await apiClient.post(`/user-badges/${userId}/mark-read/${badgeId}`);
  } catch (error) {
    console.error('Error marking badge as read:', error);
    throw error;
  }
};

// Mark all badges as read
export const markAllBadgesAsRead = async (userId: string): Promise<void> => {
  try {
    await apiClient.post(`/user-badges/${userId}/mark-all-read`);
  } catch (error) {
    console.error('Error marking all badges as read:', error);
    throw error;
  }
};