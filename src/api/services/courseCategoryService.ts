// src/api/services/courseCategoryService.ts
import apiClient from '../apiClient'; 

// Interface matching the backend DTO (from ExcellyGenLMS.Application.DTOs.Admin.CourseCategoryDtos.cs)
// This is what the backend's /CourseCategories endpoint returns.
export interface CourseCategoryDtoBackend {
  id: string;
  title: string;
  description: string;
  icon: string; // The string name of the icon (e.g., "code")
  status: string;
  totalCourses: number; 
  activeLearnersCount: number; 
  avgDuration: string; // ADDED: Matches backend DTO
}

// Get all active course categories
// This function strictly returns data as provided by the backend API.
export const getCategories = async (): Promise<CourseCategoryDtoBackend[]> => {
  try {
    console.log('Fetching categories from API...');
    const response = await apiClient.get<CourseCategoryDtoBackend[]>('/CourseCategories'); 
    console.log('API Response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('API response for categories is not an array:', response.data);
      throw new Error('Invalid API response format for categories');
    }
    
    return response.data.filter(category => category.status === 'active');
    
  } catch (error) {
    console.error('Error fetching course categories:', error);
    throw error; 
  }
};

// Get courses by category ID (retained from your original file)
export const getCoursesByCategory = async (categoryId: string) => {
  try {
    const response = await apiClient.get(`/CourseCategories/${categoryId}/courses`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching courses for category ${categoryId}:`, error);
    throw error;
  }
};