import { Badge } from '../types/BadgeTypes';

export const calculateProgressPercentage = (badge: Badge): number => {
  return (badge.currentProgress / badge.targetProgress) * 100;
};

export const filterBadgesByCategory = (badges: Badge[], category: string): Badge[] => {
  return badges.filter(badge => badge.category === category);
};

export const countEarnedBadges = (badges: Badge[]): number => {
  return badges.filter(badge => badge.isUnlocked).length;
};