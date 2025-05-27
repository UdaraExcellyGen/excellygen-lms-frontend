// Leaderboard related types
export interface Learner {
  rank: number;
  name: string;
  avatar: string;
  title: string;
  points: number;
  achievements: number;
  completedCourses: number;
  rankChange: number;
  isCurrentUser?: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
}

export interface LeaderboardData {
  [category: string]: Learner[];
}

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';