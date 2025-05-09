// src/api/services/courseCategoryService.ts
import axios from 'axios';
import { PathCard } from '../../features/Learner/CourseCategories/types/PathCard';

// Interface matching the backend DTO
export interface CourseCategoryDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses: number;
}

// Static data for fields we're keeping mock
const getMockUserData = (title: string): { activeUsers: number, avgDuration: string } => {
  const mockData: Record<string, { activeUsers: number, avgDuration: string }> = {
    "Software Engineering": { activeUsers: 1250, avgDuration: "6 months" },
    "Quality Assurance": { activeUsers: 850, avgDuration: "4 months" },
    "Project Management": { activeUsers: 950, avgDuration: "5 months" },
    "DevOps": { activeUsers: 1100, avgDuration: "6 months" },
    "UI/UX Design": { activeUsers: 780, avgDuration: "4 months" },
    "Data Science": { activeUsers: 1400, avgDuration: "8 months" },
    "Cloud Computing": { activeUsers: 920, avgDuration: "5 months" },
    "Cyber Security": { activeUsers: 1050, avgDuration: "7 months" }
  };

  return mockData[title] || { activeUsers: 800, avgDuration: "5 months" };
};

// Create a configured axios instance for API calls
const createApiClient = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5177/api';
  
  const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiClient;
};

const apiClient = createApiClient();

// Get all active course categories
export const getCategories = async (): Promise<(Omit<PathCard, 'icon'> & { iconName: string })[]> => {
  try {
    console.log('Fetching categories from API...');
    const response = await apiClient.get('/CourseCategories');
    console.log('API Response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('Could not find categories array in API response:', response.data);
      throw new Error('Invalid API response format');
    }
    
    // Map backend data to PathCard interface without the React icon component
    return response.data
      .filter(category => category.status === 'active')
      .map(category => {
        const { activeUsers, avgDuration } = getMockUserData(category.title);
        
        return {
          id: category.id,
          title: category.title,
          iconName: category.icon || 'code', // Default to 'code' if no icon
          description: category.description,
          totalCourses: category.totalCourses,
          activeUsers,
          avgDuration
        };
      });
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error;
  }
};

// Get courses by category ID
export const getCoursesByCategory = async (categoryId: string) => {
  try {
    const response = await apiClient.get(`/CourseCategories/${categoryId}/courses`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching courses for category ${categoryId}:`, error);
    throw error;
  }
};