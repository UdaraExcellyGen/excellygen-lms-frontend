// src/features/Learner/BadgesAndRewards/data/badges.ts
import { Badge } from '../types/Badge';

export const badgesData: Badge[] = [
  {
    id: 1,
    title: "Perfectionist",
    description: "Score 100% on 3 quizzes in a row",
    iconPath: "/images/badges/perfectionist.svg",
    currentProgress: 2,
    targetProgress: 3,
    isUnlocked: false,
    category: 'achievement',
    color: 'phlox'
  },
  {
    id: 2,
    title: "Fast Learner",
    description: "Complete three courses in less than 50% of estimated time",
    iconPath: "/images/badges/fast-learner.svg", 
    currentProgress: 3,
    targetProgress: 3,
    isUnlocked: true,
    category: 'learning',
    dateEarned: "2024-02-15",
    color: 'federal-blue'
  },
  {
    id: 3,
    title: "Top Performer",
    description: "Achieve first place in the leaderboard",
    iconPath: "/images/badges/top-performer.svg",
    currentProgress: 1,
    targetProgress: 1,
    isUnlocked: true,
    category: 'achievement', 
    dateEarned: "2024-02-10",
    color: 'deep-sky-blue'
  },
  {
    id: 4,
    title: "Helping Hand",
    description: "Comment or reply to 10 threads in the discussion forum",
    iconPath: "/images/badges/helping-hand.svg",
    currentProgress: 7,
    targetProgress: 10,
    isUnlocked: false,
    category: 'community',
    color: 'status-success'
  },
  {
    id: 5,
    title: "Daily Learner", 
    description: "Study 7 days in a row with 1+ hour daily goal",
    iconPath: "/images/badges/daily-learner.svg",
    currentProgress: 4,
    targetProgress: 7,
    isUnlocked: false,
    category: 'learning',
    color: 'french-violet'
  },
  {
    id: 6,
    title: "Explorer",
    description: "Complete courses from 3+ different course categories", 
    iconPath: "/images/badges/explorer.svg",
    currentProgress: 2,
    targetProgress: 3,
    isUnlocked: false,
    category: 'learning',
    color: 'heliotrope'
  }
];