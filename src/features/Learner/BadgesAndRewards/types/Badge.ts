// src/features/Learner/BadgesAndRewards/types/Badge.ts

export interface Badge {
  id: string;
  title: string;
  description: string;
  howToEarn: string;
  iconPath: string;
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  dateEarned?: string;
  category: string;
  color: string;
}

export interface UserBadgeSummary {
    totalBadges: number;
    earnedCount: number;
    readyToClaimCount: number;
    recentBadges: Badge[];
}