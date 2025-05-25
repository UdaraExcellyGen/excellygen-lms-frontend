// Path: src/api/services/learnerProjectService.ts

import apiClient from '../apiClient';
// Ensure this path is correct for your Project type definition
import { Project, ProjectStatus } from '../../features/Learner/LearnerProjects/types/Project';

// This interface mirrors Application.DTOs.Learner.ProjectDto
interface BackendProjectDto {
  id: string;           // From DTO
  name: string;         // From DTO (maps to frontend title)
  description: string;
  status: string;       // From DTO ("Assigned" or "Completed")
  startDate: string;
  endDate?: string;     // From DTO (represents expected/actual completion date)
  role: string;         // From DTO (learner's role in this project)
  technologies: string[];
  team: string[];       // <<<<< From DTO (list of team member names)
}

export const learnerProjectApi = {
  getUserProjects: async (userId: string): Promise<Project[]> => {
    if (!userId) {
      console.warn("learnerProjectApi.getUserProjects: called without a userId.");
      return []; // Or throw an error, depending on desired behavior
    }
    try {
      console.log(`learnerProjectApi.getUserProjects: Fetching projects for userId: ${userId}`);
      const response = await apiClient.get(`/user-projects/${userId}`);
      // Log the raw response from the backend to verify 'team' is present
      console.log("learnerProjectApi.getUserProjects: Raw API Response:", response.data);
      
      const backendProjects: BackendProjectDto[] = response.data;

      if (!Array.isArray(backendProjects)) {
        console.error("learnerProjectApi.getUserProjects: API response data is not an array.", response.data);
        return [];
      }

      return backendProjects.map((dto, index) => {
        let frontendId = parseInt(dto.id, 10);
        if (isNaN(frontendId)) {
          // This fallback is for frontend's `key` prop if type expects number
          console.warn(
            `learnerProjectApi.getUserProjects: Project ID "${dto.id}" from backend is not a parseable number. ` +
            `Using index ${index} as a fallback frontend ID for React key.`
          );
          frontendId = index; 
        }

        const status = dto.status as ProjectStatus;
        let projectEndDate: string | undefined = undefined; // For frontend 'endDate' (if Assigned)
        let projectCompletionDate: string | undefined = undefined; // For frontend 'completionDate' (if Completed)

        // Backend DTO's 'endDate' is overloaded; map it based on status for frontend type
        if (status === 'Completed') {
          projectCompletionDate = dto.endDate;
        } else if (status === 'Assigned') {
          projectEndDate = dto.endDate;
        }

        const frontendProject: Project = {
          id: frontendId, // This should match frontend `types/Project.ts` `id: number`
          title: dto.name, // Mapping backend 'name' to frontend 'title'
          status: status,
          description: dto.description || '',
          team: dto.team || [], // <<<<< Map the team array from the backend DTO
          role: dto.role || undefined, // Learner's specific role from backend
          startDate: dto.startDate,
          endDate: projectEndDate,
          completionDate: projectCompletionDate,
          technologies: dto.technologies || [],
        };
        return frontendProject;
      });
    } catch (error) {
      console.error(`learnerProjectApi.getUserProjects: Error fetching projects for userId ${userId}:`, error);
      throw error; // Re-throw to be handled by the calling component
    }
  }
};