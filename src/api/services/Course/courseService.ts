// src/api/services/Course/courseService.ts
import apiClient from '../../apiClient';
import {
    CategoryDto,
    TechnologyDto,
    CourseDto,
    LessonDto,
    CourseDocumentDto,
    CreateLessonPayload,
    UpdateLessonPayload,
    CreateCoursePayload,
    UpdateCourseCoordinatorDtoFE,
    OverallLmsStatsDto
} from '../../../types/course.types';
import { AxiosRequestConfig } from 'axios';

// --- Fetch Lookups ---

export const getCourseCategories = async (config?: AxiosRequestConfig): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/courses/categories', config);
    return response.data;
};

export const getTechnologies = async (config?: AxiosRequestConfig): Promise<TechnologyDto[]> => {
    const response = await apiClient.get<TechnologyDto[]>('/courses/technologies', config);
    return response.data;
};

// --- Course Operations ---

export const createCourse = async (
    courseData: CreateCoursePayload,
    thumbnailImage: File | null
): Promise<CourseDto> => {
    const formData = new FormData();
    formData.append('Title', courseData.title);
    if (courseData.description) {
        formData.append('Description', courseData.description);
    }
    formData.append('EstimatedTime', courseData.estimatedTime.toString());
    formData.append('CategoryId', courseData.categoryId);
    (courseData.technologyIds || []).forEach((id) => {
        formData.append('TechnologyIds', id);
    });

    if (thumbnailImage) {
        formData.append('ThumbnailImage', thumbnailImage, thumbnailImage.name);
    }

    const response = await apiClient.post<CourseDto>('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getCourseById = async (courseId: number, config?: AxiosRequestConfig): Promise<CourseDto> => {
    const response = await apiClient.get<CourseDto>(`/courses/${courseId}`, config);
    return response.data;
};

export const updateCourseBasicDetails = async (
    courseId: number,
    courseData: Partial<UpdateCourseCoordinatorDtoFE>,
    thumbnailImage: File | null
): Promise<CourseDto> => {
    const formData = new FormData();
    if (courseData.title) formData.append('Title', courseData.title);
    if (courseData.description) formData.append('Description', courseData.description);
    if (courseData.estimatedTime) formData.append('EstimatedTime', courseData.estimatedTime.toString());
    if (courseData.categoryId) formData.append('CategoryId', courseData.categoryId);
    if (courseData.technologyIds) {
        courseData.technologyIds.forEach((id) => formData.append('TechnologyIds', id));
    }
    if (thumbnailImage) {
        formData.append('ThumbnailImage', thumbnailImage, thumbnailImage.name);
    }

    const response = await apiClient.put<CourseDto>(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

/**
 * SOFT DELETE: Deactivates a PUBLISHED course, hiding it from the catalog.
 * @param courseId The ID of the course to deactivate.
 */
export const deactivateCourse = async (courseId: number): Promise<void> => {
    await apiClient.put(`/courses/${courseId}/deactivate`);
};

/**
 * REACTIVATE: Makes an inactive course active and visible again.
 * @param courseId The ID of the course to reactivate.
 */
export const reactivateCourse = async (courseId: number): Promise<void> => {
    await apiClient.put(`/courses/${courseId}/reactivate`);
};

/**
 * HARD DELETE: Permanently deletes a course. Intended for DRAFT courses only.
 * @param courseId The ID of the course to delete forever.
 */
export const hardDeleteCourse = async (courseId: number): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}`);
};

export const publishCourse = async (courseId: number): Promise<void> => {
    await apiClient.patch(`/courses/${courseId}/publish`);
};

export const getAllCourses = async (): Promise<CourseDto[]> => {
    const response = await apiClient.get<CourseDto[]>('/courses');
    return response.data;
};

// --- Lesson (Subtopic) Operations ---

export const addLesson = async (payload: CreateLessonPayload): Promise<LessonDto> => {
    const response = await apiClient.post<LessonDto>('/courses/lessons', payload);
    return response.data;
};

export const updateLesson = async (lessonId: number, payload: UpdateLessonPayload): Promise<LessonDto> => {
    const response = await apiClient.put<LessonDto>(`/courses/lessons/${lessonId}`, payload);
    return response.data;
};

export const deleteLesson = async (lessonId: number): Promise<void> => {
    await apiClient.delete(`/courses/lessons/${lessonId}`);
};

// --- Document Operations ---

export const uploadDocument = async (lessonId: number, file: File): Promise<CourseDocumentDto> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await apiClient.post<CourseDocumentDto>(
        `/courses/lessons/${lessonId}/documents`,
        formData,
        { 
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000 
        }
    );
    return response.data;
};

export const deleteDocument = async (documentId: number): Promise<void> => {
    await apiClient.delete(`/courses/documents/${documentId}`);
};

//for Course Management stat card
export const getLmsOverallStats = async (): Promise<OverallLmsStatsDto> => {
    const response = await apiClient.get<OverallLmsStatsDto>('/stats/overall-lms-stats');
    return response.data;
};