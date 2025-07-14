export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  title: string | null;
  avatar: string | null;
  points: number;
  isCurrentUser: boolean;
}

export interface UserRank {
  rank: number;
  points: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank: UserRank | null;
}