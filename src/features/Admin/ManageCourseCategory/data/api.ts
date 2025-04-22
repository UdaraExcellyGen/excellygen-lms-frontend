import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';
import { createApiClient, handleApiError } from '../../../../utils/apiConfig';

const apiClient = createApiClient();

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get('/CourseCategories');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await apiClient.get(`/CourseCategories/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new category
export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
  try {
    const response = await apiClient.post('/CourseCategories', category);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Update a category
export const updateCategory = async (id: string, category: UpdateCategoryDto): Promise<Category> => {
  try {
    const response = await apiClient.put(`/CourseCategories/${id}`, category);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/CourseCategories/${id}`);
  } catch (error) {
    return handleApiError(error);
  }
};

// Toggle category status
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  try {
    const response = await apiClient.patch(`/CourseCategories/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};