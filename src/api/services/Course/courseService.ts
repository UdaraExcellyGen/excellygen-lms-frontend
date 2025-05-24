// src/api/services/Course/courseService.ts
import apiClient from '../../apiClient';
import { CategoryDto, TechnologyDto, CourseDto,LessonDto,CourseDocumentDto,CreateLessonPayload,
    UpdateLessonPayload,UpdateCourseCoordinatorDtoFE } from '../../../types/course.types'; // Define these types next

// --- Fetch Lookups ---

export const getCourseCategories = async (): Promise<CategoryDto[]> => {
  const response = await apiClient.get<CategoryDto[]>('/courses/categories');
  return response.data;
};

export const getTechnologies = async (): Promise<TechnologyDto[]> => {
  const response = await apiClient.get<TechnologyDto[]>('/courses/technologies');
  return response.data;
};

// --- Create Course (Step 1) ---

// This type matches the data sent within FormData, excluding the file
// Note: estimatedTime might be sent as string or number depending on how you handle it
interface CreateCourseFormData {
    title: string;
    description?: string;
    estimatedTime: number; // Ensure conversion to number before sending
    categoryId: string;
    technologyIds: string[];
}

// The service function accepts the structured data plus the optional file
export const createCourse = async (
    courseData: CreateCourseFormData,
    thumbnailImage: File | null
): Promise<CourseDto> => {

    const formData = new FormData();

    // Append standard fields
    formData.append('Title', courseData.title);
    if (courseData.description) {
        formData.append('Description', courseData.description);
    }
    formData.append('EstimatedTime', courseData.estimatedTime.toString()); // Send as string if needed, backend model binding handles it
    formData.append('CategoryId', courseData.categoryId);

    // Append list items individually
    courseData.technologyIds.forEach((id, index) => {
        formData.append(`TechnologyIds[${index}]`, id);
        // Or simply: formData.append('TechnologyIds', id); if backend binding supports it
    });

    // Append the file if it exists
    if (thumbnailImage) {
        formData.append('ThumbnailImage', thumbnailImage, thumbnailImage.name);
    }

    // Make the POST request with FormData
    const response = await apiClient.post<CourseDto>('/courses', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Axios might set this automatically with FormData, but explicitly can help
        },
    });

    return response.data; // Backend returns the created CourseDto
};

// --- Placeholder for future functions ---
export const getCourseById = async (courseId: number): Promise<CourseDto> => {
    const response = await apiClient.get<CourseDto>(`/courses/${courseId}`);
    return response.data;
};

// ======================================
// NEW FUNCTIONS FOR LESSONS & DOCUMENTS
// ======================================

// --- Lesson (Subtopic) Operations ---

// interface CreateLessonPayload {
//     courseId: number;
//     lessonName: string;
//     lessonPoints: number;
// }

export const addLesson = async (payload: CreateLessonPayload): Promise<LessonDto> => {
    const response = await apiClient.post<LessonDto>('/courses/lessons', payload);
    return response.data;
};

// interface UpdateLessonPayload {
//     lessonName: string;
//     lessonPoints: number;
// }

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
    formData.append('file', file, file.name); // Backend expects the file under the key 'file'

    const response = await apiClient.post<CourseDocumentDto>(
        `/courses/lessons/${lessonId}/documents`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        }
    );
    return response.data;
};

export const deleteDocument = async (documentId: number): Promise<void> => {
    await apiClient.delete(`/courses/documents/${documentId}`);
};

// ======================================
// NEW FUNCTION FOR PUBLISHING COURSE
// ======================================
export const publishCourse = async (courseId: number): Promise<void> => {
    await apiClient.patch(`/courses/${courseId}/publish`);
    // No response body expected (204 No Content on success)
};

// ======================================
// NEW FUNCTION TO FETCH COURSES
// ======================================
export const getAllCourses = async (): Promise<CourseDto[]> => {
    // This endpoint currently fetches ALL courses.
    // For a coordinator's page, you'd ideally have an endpoint that
    // filters courses by the creatorId on the backend.
    // e.g., await apiClient.get<CourseDto[]>('/courses/my-courses');
    const response = await apiClient.get<CourseDto[]>('/courses');
    return response.data;
};

// Function to delete a course (if not already present)
export const deleteCourse = async (courseId: number): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}`);
};

// --- Payload for Update Course Basic Details ---
// This should mirror the backend's UpdateCourseCoordinatorDto for the form fields
// If UpdateCourseCoordinatorDto is already in course.types.ts, use that.
export interface UpdateCourseBasicDetailsPayload {
    title: string;
    description?: string;
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}

// =======================================================
// UPDATED FUNCTION FOR UPDATING BASIC COURSE DETAILS
// =======================================================
export const updateCourseBasicDetails = async (
    courseId: number,
    courseData: UpdateCourseCoordinatorDtoFE, // <<< USE THE IMPORTED TYPE
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
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Add other functions like updateCourse, deleteCourse, publishCourse etc. as needed

// Add functions for updateCourse, deleteCourse, publishCourse, addLesson, updateLesson, deleteLesson, uploadDocument, deleteDocument etc. as needed later.