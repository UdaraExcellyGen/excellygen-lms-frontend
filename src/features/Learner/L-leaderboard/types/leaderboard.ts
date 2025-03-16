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