// src/features/Admin/CategoryCourses/data/api.ts
import { Course, CourseCategory, UpdateCourseAdminDto } from '../types/course.types';
import apiClient from '../../../../api/apiClient';

export const getCategoryById = async (id: string): Promise<CourseCategory> => {
    const response = await apiClient.get(`/CourseCategories/${id}`);
    return response.data;
};

export const getCoursesByCategory = async (categoryId: string): Promise<Course[]> => {
    const response = await apiClient.get(`/CourseCategories/${categoryId}/courses`);
    return response.data;
};

export const updateCourseAdmin = async (id: number, course: UpdateCourseAdminDto): Promise<Course> => {
    // Corrected to use the admin-specific controller for courses
    const response = await apiClient.put(`/CoursesAdmin/${id}`, course);
    return response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
    // Corrected to use the admin-specific controller for courses
    await apiClient.delete(`/CoursesAdmin/${id}`);
};