// src/api/services/Course/learnerCourseService.ts
import apiClient from '../../apiClient';
import { LearnerCourseDto, LessonProgressDto, MarkLessonCompletedPayload } from '../../../types/course.types';

// Get all available courses for the current learner (not enrolled in yet)
export const getAvailableCoursesForLearner = async (categoryId?: string): Promise<LearnerCourseDto[]> => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const response = await apiClient.get<LearnerCourseDto[]>(`/LearnerCourses/available${params}`);
    return response.data;
};

// Get all courses the current learner is enrolled in
export const getEnrolledCoursesForLearner = async (): Promise<LearnerCourseDto[]> => {
    const response = await apiClient.get<LearnerCourseDto[]>('/LearnerCourses/enrolled');
    return response.data;
};

// Get detailed information for a specific course for the current learner (including their progress)
export const getLearnerCourseDetails = async (courseId: number): Promise<LearnerCourseDto> => {
    const response = await apiClient.get<LearnerCourseDto>(`/LearnerCourses/${courseId}`);
    return response.data;
};

// Mark a specific lesson as completed for the current learner
export const markLessonCompleted = async (lessonId: number): Promise<LessonProgressDto> => {
    const payload: MarkLessonCompletedPayload = { lessonId };
    const response = await apiClient.patch<LessonProgressDto>(`/LearnerCourses/lessons/${lessonId}/complete`, payload);
    return response.data;
};