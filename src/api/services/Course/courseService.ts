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
    CreateCoursePayload, // Use the refined type
    UpdateCourseCoordinatorDtoFE // Use the refined type
} from '../../../types/course.types';

// --- Fetch Lookups ---

export const getCourseCategories = async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/courses/categories');
    return response.data;
};

export const getTechnologies = async (): Promise<TechnologyDto[]> => {
    const response = await apiClient.get<TechnologyDto[]>('/courses/technologies');
    return response.data;
};

// --- Course Operations ---

export const createCourse = async (
    courseData: CreateCoursePayload, // Use CreateCoursePayload
    thumbnailImage: File | null
): Promise<CourseDto> => {
    const formData = new FormData();
    formData.append('Title', courseData.title);
    if (courseData.description) {
        formData.append('Description', courseData.description);
    }
    formData.append('EstimatedTime', courseData.estimatedTime.toString());
    formData.append('CategoryId', courseData.categoryId);
    courseData.technologyIds.forEach((id) => {
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

export const getCourseById = async (courseId: number): Promise<CourseDto> => {
    const response = await apiClient.get<CourseDto>(`/courses/${courseId}`);
    return response.data;
};

export const updateCourseBasicDetails = async (
    courseId: number,
    courseData: UpdateCourseCoordinatorDtoFE, // Use UpdateCourseCoordinatorDtoFE
    thumbnailImage: File | null
): Promise<CourseDto> => {
    const formData = new FormData();
    formData.append('Title', courseData.title);
    if (courseData.description) {
        formData.append('Description', courseData.description);
    }
    formData.append('EstimatedTime', courseData.estimatedTime.toString());
    formData.append('CategoryId', courseData.categoryId);
    courseData.technologyIds.forEach((id) => {
        formData.append('TechnologyIds', id);
    });

    if (thumbnailImage) {
        formData.append('ThumbnailImage', thumbnailImage, thumbnailImage.name);
    }

    const response = await apiClient.put<CourseDto>(`/courses/${courseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const deleteCourse = async (courseId: number): Promise<void> => {
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
};

export const deleteDocument = async (documentId: number): Promise<void> => {
    await apiClient.delete(`/courses/documents/${documentId}`);
};