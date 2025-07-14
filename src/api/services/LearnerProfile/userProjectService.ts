import apiClient from '../../apiClient';

// This DTO mirrors the backend's ProjectDto
interface BackendProjectDto {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  role: string;
  technologies: string[];
}

export const getUserProjects = async (userId: string): Promise<BackendProjectDto[]> => {
  if (!userId) return [];
  try {
    const response = await apiClient.get<BackendProjectDto[]>(`/user-projects/${userId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching projects for userId ${userId}:`, error);
    throw error;
  }
};