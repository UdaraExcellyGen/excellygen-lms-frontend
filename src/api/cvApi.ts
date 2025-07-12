// src/api/cvApi.ts
import apiClient from './apiClient';

// These types should align with your backend CvDto and the UserData structure
// used by your CV components.
export interface CvPersonalInfo {
  name: string;
  position: string; // Maps to JobRole from backend UserProfile
  email: string;
  phone: string;
  department: string;
  photo?: string | null; // Avatar from backend UserProfile
  summary: string; // About section from backend UserProfile
}

export interface CvProject {
  title: string;        // name from backend Project
  description: string;
  technologies: string[];
  startDate: string;
  completionDate?: string | null; // endDate from backend Project if status is 'Completed'
  status: string;
}

export interface CvCourse {
  title: string;        // name from backend Certification
  provider: string;     // issuingOrganization from backend Certification
  completionDate: string; // issueDate from backend Certification
  duration?: string | null; // This is not directly available, will be null/undefined
  certificate: boolean; // Assumed true for completed certifications
}

export interface CvDataResponse {
  personalInfo: CvPersonalInfo;
  projects: CvProject[];
  courses: CvCourse[]; // Represents completed certifications from backend
  skills: string[];    // UserTechnologies from backend
}

/**
 * Fetches CV data for a given user ID from the learner-specific CV endpoint.
 * @param userId The ID of the user.
 * @returns Promise with the user's CV data.
 */
export const getCvData = async (userId: string): Promise<CvDataResponse> => {
  try {
    // The route matches the CvController route: [Route("api/learner/[controller]")]
    const response = await apiClient.get(`/learner/cv/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching CV data for user ${userId}:`, error);
    if ((error as any).response?.status === 404) {
        throw new Error(`CV data not found for user ${userId}. The user profile might not exist or is incomplete.`);
    }
    throw error; 
  }
};