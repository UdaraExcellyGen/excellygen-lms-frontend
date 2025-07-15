// src/api/services/Learner/badgesAndRewardsService.ts

import apiClient from "../../apiClient";
import { Badge } from "../../../features/Learner/BadgesAndRewards/types/Badge";

// This function is for the "My Badges & Rewards" page, calling the endpoint without a user ID
export const getBadgesAndRewards = async (): Promise<Badge[]> => {
  try {
    const response = await apiClient.get('/badges');
    return response.data;
  } catch (error) {
    console.error('Error fetching badges and rewards for current user:', error);
    throw error;
  }
};

// =================================================================
// NEW FUNCTION for fetching another user's badges for their profile page
// =================================================================
export const getBadgesForUser = async (userId: string): Promise<Badge[]> => {
    try {
        const response = await apiClient.get(`/badges/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching badges for user ${userId}:`, error);
        // Return empty array to prevent profile page from crashing
        return [];
    }
}
// =================================================================

// The claim function remains the same
export const claimBadge = async (badgeId: string): Promise<Badge> => {
  try {
    const response = await apiClient.post(`/badges/${badgeId}/claim`);
    return response.data;
  } catch (error) {
    console.error(`Error claiming badge ${badgeId}:`, error);
    throw error;
  }
};