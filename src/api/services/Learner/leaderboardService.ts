import apiClient from '../../apiClient';
import { LeaderboardData } from '../../../features/Learner/Leaderboard/types/leaderboard';

export const getLeaderboardData = async (): Promise<LeaderboardData> => {
  try {
    const response = await apiClient.get<LeaderboardData>('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    throw new Error('Failed to fetch leaderboard data. Please try again later.');
  }
};