import apiClient from '../../apiClient';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  role: string;
  technologies: string[];
}

// Get all projects for a user
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await apiClient.get(`/user-projects/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
};

// Get specific project details
export const getUserProject = async (userId: string, projectId: string): Promise<Project> => {
  try {
    const response = await apiClient.get(`/user-projects/${userId}/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user project:', error);
    throw error;
  }
};

// Update user project status
export const updateUserProject = async (userId: string, projectId: string, status: string): Promise<Project> => {
  try {
    const response = await apiClient.put(`/user-projects/${userId}/${projectId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
};

// Update user project details
export const updateUserProjectDetails = async (
  userId: string, 
  projectId: string, 
  projectData: Partial<Project>
): Promise<Project> => {
  try {
    const response = await apiClient.put(`/user-projects/${userId}/${projectId}/details`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project details:', error);
    throw error;
  }
};