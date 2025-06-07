// src/types/course.types.ts

import { QuizDto } from './quiz.types';

// Backend DTOs mapped to TypeScript interfaces

export interface UserBasicDto {
    id: string;
    name: string;
}

export interface CategoryDto {
    id: string;
    title: string;
}

export interface TechnologyDto {
    id: string;
    name: string;
}

export interface CourseDocumentDto {
    id: number;
    name: string;
    documentType: 'PDF' | 'Word'; // Corresponds to backend DocumentType enum values
    fileSize: number; // In bytes
    fileUrl: string; // Publicly accessible URL
    lastUpdatedDate: string; // ISO 8601 string
    lessonId: number;
}

// Base LessonDto from backend (without quizzes)
export interface LessonDto {
    id: number;
    lessonName: string;
    lessonPoints: number;
    lastUpdatedDate: string; // ISO 8601 string
    courseId: number;
    documents: CourseDocumentDto[];
    quizzes?: QuizDto[]; // Optional, might be populated client-side or by specific backend DTO
}

export interface CourseDto {
    id: number;
    title: string;
    description: string | null;
    calculatedCoursePoints: number | null;
    estimatedTime: number; // In Hours
    createdAt: string; // ISO 8601 string
    lastUpdatedDate: string; // ISO 8601 string
    status: 'Draft' | 'Published' | 'Archived'; // Corresponds to backend CourseStatus enum values
    thumbnailUrl: string | null;
    category: CategoryDto;
    creator: UserBasicDto;
    technologies: TechnologyDto[];
    lessons: LessonDto[];
}

// Learner Module DTOs (from backend LearnerCourseDto.cs, LessonProgressDto.cs, CertificateDto.cs)

export interface LearnerLessonDto {
    id: number;
    lessonName: string;
    lessonPoints: number;
    lastUpdatedDate: string;
    documents: CourseDocumentDto[];
    isCompleted: boolean; // Learner's progress on this lesson
    hasQuiz: boolean; // Indicates if this lesson has an associated quiz
    quizId: number | null; // The ID of the quiz for this lesson, if any
    isQuizCompleted: boolean; // Indicates if the quiz for this lesson is completed by the learner
}

export interface LearnerCourseDto {
    id: number;
    title: string;
    description: string | null;
    estimatedTime: number; // In Hours
    thumbnailUrl: string | null;
    category: CategoryDto;
    technologies: TechnologyDto[];
    status: 'Draft' | 'Published' | 'Archived'; // Course status (e.g., Draft, Published)
    enrollmentId: number | null;
    // Learner-specific fields
    isEnrolled: boolean;
    enrollmentDate: string | null; // ISO 8601 string
    enrollmentStatus: string; // e.g., "active", "completed", "withdrawn"
    progressPercentage: number; // Calculated based on completed lessons/quizzes
    totalLessons: number;
    completedLessons: number;
    lessons: LearnerLessonDto[];
}

export interface LessonProgressDto {
    id: number;
    userId: string;
    lessonId: number;
    lessonName: string; // For convenience
    isCompleted: boolean;
    completionDate: string | null; // ISO 8601 string
}

export interface MarkLessonCompletedPayload {
    lessonId: number;
}

export interface CertificateDto {
    id: number;
    userId: string;
    userName: string;
    courseId: number;
    courseTitle: string;
    completionDate: string;
    title: string;
    certificateFileUrl: string;
}

export interface GenerateCertificatePayload {
    courseId: number;
}

// Enrollment DTOs (from backend EnrollmentDto.cs)
export interface EnrollmentDto {
    id: number;
    userId: string;
    courseId: number;
    enrollmentDate: string;
    status: string; // e.g., "active", "completed", "withdrawn"
    userName: string;
    courseTitle: string;
}

export interface CreateEnrollmentPayload {
    userId: string;
    courseId: number;
    status?: string; // "active" by default on backend
}

export interface UpdateEnrollmentPayload {
    status: string;
}

// Frontend-specific payloads for API requests (match backend DTOs where applicable)

export interface CreateCoursePayload {
    title: string;
    description?: string; // Optional field
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}

export interface UpdateCourseCoordinatorDtoFE {
    title: string;
    description?: string; // Optional field
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}

export interface CreateLessonPayload {
    courseId: number;
    lessonName: string;
    lessonPoints: number;
}

export interface UpdateLessonPayload {
    lessonName: string;
    lessonPoints: number;
}

// Frontend-specific state types for UI management

export interface BasicCourseDetailsState {
    title: string;
    description: string;
    estimatedTime: string; // Stored as string for input field
    categoryId: string;
    technologies: string[]; // Stores technology IDs
    thumbnail: File | null; // Represents the actual file selected for upload
}

export interface CategoryOption {
    id: string;
    title: string;
}

export interface TechnologyOption {
    id: string;
    name: string;
}

export interface ExistingMaterialFile extends CourseDocumentDto {
    // Extends CourseDocumentDto, no additional fields currently
}

export interface SubtopicFE {
    id: number; // Database Lesson ID
    lessonName: string;
    lessonPoints: number;
    courseId: number;
    documents: ExistingMaterialFile[]; // Holds saved documents
    isEditing?: boolean;
    originalName?: string;
    originalPoints?: number;
}

export interface CourseContextState {
    createdCourseId: number | null; // Store ID after creation
    basicDetails: BasicCourseDetailsState; // Store state from step 1
    lessons: SubtopicFE[]; // Use the frontend-specific type
    lessonsLoaded: boolean;
}

// ADDED: OverallLmsStatsDto from backend ExcellyGenLMS.Application/DTOs/CommonStatsDto.cs
// This is used for overall LMS statistics (Total Courses, Active Learners, etc.)
export interface OverallLmsStatsDto {
    totalCategories: number;
    totalPublishedCourses: number;
    totalActiveLearners: number;
    totalActiveCoordinators: number;
    totalProjectManagers: number;
    averageCourseDurationOverall: string;
}

export interface UpdateCourseCoordinatorDtoFE {
    title: string;
    description?: string; // Optional field
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}