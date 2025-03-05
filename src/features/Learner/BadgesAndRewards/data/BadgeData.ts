import { Trophy, Award, Star, Users, Calendar, Compass } from 'lucide-react';
import { Badge } from '../types/BadgeTypes';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 1,
    title: "Perfectionist",
    description: "Score 100% on 3 quizzes in a row",
    icon: Trophy,
    currentProgress: 2,
    targetProgress: 3,
    isUnlocked: false,
    category: 'achievement'
  },
  {
    id: 2,
    title: "Fast Learner",
    description: "Complete three courses in less than 50% of estimated time",
    icon: Star,
    currentProgress: 3,
    targetProgress: 3,
    isUnlocked: true,
    category: 'learning',
    dateEarned: "2024-02-15"
  },
  
];

export const BADGE_CATEGORIES = {
  ACHIEVEMENT: 'achievement',
  LEARNING: 'learning',
  COMMUNITY: 'community'
};