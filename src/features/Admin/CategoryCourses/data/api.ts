import { Course, CourseCategory, UpdateCourseAdminDto } from '../types/course.types';
import { createApiClient, handleApiError } from '../../../../utils/apiConfig';

const apiClient = createApiClient();

// Get category by ID
export const getCategoryById = async (id: string): Promise<CourseCategory> => {
  try {
    const response = await apiClient.get(`/CourseCategories/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get courses by category ID
export const getCoursesByCategory = async (categoryId: string): Promise<Course[]> => {
  try {
    console.log(`Fetching courses for category: ${categoryId}`);
    const response = await apiClient.get(`/CourseCategories/${categoryId}/courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return handleApiError(error);
  }
};

// Update course (use existing courses endpoint)
export const updateCourseAdmin = async (id: string, course: UpdateCourseAdminDto): Promise<Course> => {
  try {
    const response = await apiClient.put(`/Courses/${id}`, course);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete course (use existing courses endpoint)
export const deleteCourse = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/Courses/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};