import apiClient from '../../apiClient';
import { Badge } from '../../../features/Learner/BadgesAndRewards/types/Badge';

/**
 * Fetches all badges and the current user's progress for them.
 * @returns A promise that resolves to an array of Badge objects.
 */
export const getBadgesAndRewards = async (): Promise<Badge[]> => {
  try {
    const response = await apiClient.get<Badge[]>('/badges');
    return response.data;
  } catch (error) {
    console.error('API Error fetching badges and rewards:', error);
    throw new Error('Failed to retrieve your badges. Please try again later.');
  }
};

/**
 * Claims a specific badge that the user has unlocked.
 * @param badgeId - The ID of the badge to claim.
 * @returns A promise that resolves to the updated Badge object.
 */
export const claimBadge = async (badgeId: string): Promise<Badge> => {
  try {
    const response = await apiClient.post<Badge>(`/badges/${badgeId}/claim`);
    return response.data;
  } catch (error) {
    console.error(`API Error claiming badge ${badgeId}:`, error);
    throw new Error('Failed to claim the badge. Please try again.');
  }
};