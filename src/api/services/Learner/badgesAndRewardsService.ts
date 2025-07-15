// src/api/services/Learner/badgesAndRewardsService.ts

import apiClient from "../../apiClient";
import { Badge } from "../../../features/Learner/BadgesAndRewards/types/Badge";

const BADGE_CLAIM_STORAGE_KEY = 'recentBadgeClaims';

// This interface defines the structure of the data we'll store.
interface StoredBadgeClaim {
    badgeId: string;
    badgeTitle: string;
    claimTime: string; // ISO date string
}

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

// The claim function is now updated to log the activity
export const claimBadge = async (badgeId: string): Promise<Badge> => {
  try {
    const response = await apiClient.post(`/badges/${badgeId}/claim`);
    const claimedBadge: Badge = response.data;

    // *** NEW: Log the successful claim to session storage ***
    try {
        const existingClaimsRaw = sessionStorage.getItem(BADGE_CLAIM_STORAGE_KEY);
        const existingClaims: StoredBadgeClaim[] = existingClaimsRaw ? JSON.parse(existingClaimsRaw) : [];

        // Prevent duplicate logging
        if (!existingClaims.some(c => c.badgeId === claimedBadge.id)) {
            const newClaim: StoredBadgeClaim = {
                badgeId: claimedBadge.id,
                badgeTitle: claimedBadge.title,
                claimTime: new Date().toISOString(), // Use current time for the activity feed
            };

            const updatedClaims = [newClaim, ...existingClaims].slice(0, 5);
            sessionStorage.setItem(BADGE_CLAIM_STORAGE_KEY, JSON.stringify(updatedClaims));
        }
    } catch (e) {
        console.error("Could not save badge claim to session storage:", e);
    }
    // **********************************************************

    return claimedBadge;
  } catch (error) {
    console.error(`Error claiming badge ${badgeId}:`, error);
    throw error;
  }
};