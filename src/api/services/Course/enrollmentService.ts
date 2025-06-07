// // src/api/services/Course/enrollmentService.ts
// import apiClient from '../../apiClient';
// import { EnrollmentDto, CreateEnrollmentPayload, UpdateEnrollmentPayload } from '../../../types/course.types';

// // Utility function to get current user ID from local storage (if needed, or pass from context)
// const getUserIdFromLocalStorage = (): string => {
//     const userJson = localStorage.getItem('user');
//     if (userJson) {
//         const user = JSON.parse(userJson);
//         return user.id;
//     }
//     throw new Error('User ID not found in local storage. User must be logged in.');
// };


// // Enroll a user in a course
// export const createEnrollment = async (courseId: number): Promise<EnrollmentDto> => {
//     const userId = getUserIdFromLocalStorage(); // Get user ID from local storage or AuthContext
//     const payload: CreateEnrollmentPayload = {
//         userId: userId,
//         courseId: courseId,
//         status: "active" // Default status
//     };
//     const response = await apiClient.post<EnrollmentDto>('/enrollments', payload);
//     return response.data;
// };

// // Unenroll a user from a course (logical delete or status update)
// export const deleteEnrollment = async (enrollmentId: number): Promise<void> => {
//     await apiClient.delete(`/enrollments/${enrollmentId}`);
// };

// // Get a specific enrollment (optional, might not be directly used by frontend)
// export const getEnrollmentById = async (enrollmentId: number): Promise<EnrollmentDto> => {
//     const response = await apiClient.get<EnrollmentDto>(`/enrollments/${enrollmentId}`);
//     return response.data;
// };

// // Get all enrollments for the current user
// // NOTE: Your backend EnrollmentsController.cs does NOT have a /enrollments?userId={userId} endpoint.
// // It has /enrollments (for all), /enrollments/{id}, and Create/Update/Delete.
// // If you need to get enrollments by userId, the backend should have:
// // [HttpGet("user")] in EnrollmentsController that gets current user's enrollments.
// // For now, this call won't work correctly as is with your current backend.
// // Reverting to the backend's default behavior for a quick fix for now.
// export const getMyEnrollments = async (): Promise<EnrollmentDto[]> => {
//     // This would require a backend endpoint like /enrollments/user
//     // For now, assuming you might have an admin endpoint or similar,
//     // or you'd fetch ALL and filter if that's acceptable.
//     // If you add [HttpGet("user")] to EnrollmentsController, change this to:
//     // const response = await apiClient.get<EnrollmentDto[]>('/enrollments/user');
//     // For now, to avoid 404, this will call the admin get all endpoint (if user is admin)
//     // or just return empty for a learner. This function might need adjustment based on BE.
//     ////***console.warn("getMyEnrollments: This frontend function's backend endpoint might not be correctly exposed for learners.");
//     // Temporarily call GET /enrollments (requires Admin/Coordinator role)
//     // Or, if this is for the currently authenticated user, your backend needs an endpoint for that.
//     // Assuming backend will implement a specific "Get for authenticated user" endpoint
//     // For now, returning an empty array to avoid frontend errors.
//     ////*return []; 
//     try {
//         // This endpoint should return enrollments relevant to the current user's role.
//         // For a CourseCoordinator, this might be all enrollments in courses they manage,
//         // or all enrollments if they have global visibility.
//         // The backend endpoint /enrollments needs to handle this logic.
//         console.log("Fetching enrollments via getMyEnrollments...");
//         const response = await apiClient.get<EnrollmentDto[]>('/enrollments');
//         console.log("Fetched enrollments: ", response.data.length);
//         return response.data;
//     } catch (error) {
//         console.error("getMyEnrollments: Error fetching enrollments. Ensure the backend endpoint '/enrollments' is correctly configured for the 'CourseCoordinator' role and returns the expected data.", error);
//         // It's better to throw the error so the calling component can handle it (e.g., show an error message)
//         throw error;
//         // return []; // Avoid returning empty array on error unless it's a specific design choice
//     }
// };


// // Update enrollment status (e.g., to 'completed' or 'withdrawn')
// export const updateEnrollmentStatus = async (enrollmentId: number, status: string): Promise<EnrollmentDto> => {
//     const payload: UpdateEnrollmentPayload = { status };
//     const response = await apiClient.put<EnrollmentDto>(`/enrollments/${enrollmentId}`, payload);
//     return response.data;
// };

// src/api/services/Course/enrollmentService.ts
import apiClient from '../../apiClient';
import { EnrollmentDto, CreateEnrollmentPayload, UpdateEnrollmentPayload } from '../../../types/course.types';

// Utility function to get current user ID from local storage (if needed, or pass from context)
const getUserIdFromLocalStorage = (): string => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        const user = JSON.parse(userJson);
        return user.id;
    }
    throw new Error('User ID not found in local storage. User must be logged in.');
};


// Enroll a user in a course
export const createEnrollment = async (courseId: number): Promise<EnrollmentDto> => {
    const userId = getUserIdFromLocalStorage(); // Get user ID from local storage or AuthContext
    const payload: CreateEnrollmentPayload = {
        userId: userId,
        courseId: courseId,
        status: "active" // Default status
    };
    const response = await apiClient.post<EnrollmentDto>('/enrollments', payload);
    return response.data;
};

// Unenroll a user from a course (logical delete or status update)
export const deleteEnrollment = async (enrollmentId: number): Promise<void> => {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
};

// Get a specific enrollment (optional, might not be directly used by frontend)
export const getEnrollmentById = async (enrollmentId: number): Promise<EnrollmentDto> => {
    const response = await apiClient.get<EnrollmentDto>(`/enrollments/${enrollmentId}`);
    return response.data;
};

// Get all enrollments for the current user
// NOTE: Your backend EnrollmentsController.cs does NOT have a /enrollments?userId={userId} endpoint.
// It has /enrollments (for all), /enrollments/{id}, and Create/Update/Delete.
// If you need to get enrollments by userId, the backend should have:
// [HttpGet("user")] in EnrollmentsController that gets current user's enrollments.
// For now, this call won't work correctly as is with your current backend.
// Reverting to the backend's default behavior for a quick fix for now.
export const getMyEnrollments = async (): Promise<EnrollmentDto[]> => {
    // This would require a backend endpoint like /enrollments/user
    // For now, assuming you might have an admin endpoint or similar,
    // or you'd fetch ALL and filter if that's acceptable.
    // If you add [HttpGet("user")] to EnrollmentsController, change this to:
    // const response = await apiClient.get<EnrollmentDto[]>('/enrollments/user');
    // For now, to avoid 404, this will call the admin get all endpoint (if user is admin)
    // or just return empty for a learner. This function might need adjustment based on BE.
    console.warn("getMyEnrollments: This frontend function's backend endpoint might not be correctly exposed for learners.");
    // Temporarily call GET /enrollments (requires Admin/Coordinator role)
    // Or, if this is for the currently authenticated user, your backend needs an endpoint for that.
    // Assuming backend will implement a specific "Get for authenticated user" endpoint
    // For now, returning an empty array to avoid frontend errors.
    return []; 
};


// Update enrollment status (e.g., to 'completed' or 'withdrawn')
export const updateEnrollmentStatus = async (enrollmentId: number, status: string): Promise<EnrollmentDto> => {
    const payload: UpdateEnrollmentPayload = { status };
    const response = await apiClient.put<EnrollmentDto>(`/enrollments/${enrollmentId}`, payload);
    return response.data;
};

// --- NEWLY ADDED FUNCTION ---
/**
 * Get all enrollments. Intended for Admin/Coordinator views.
 * Assumes the backend /enrollments endpoint returns all enrollments
 * when called by a user with appropriate permissions (e.g., Admin, CourseCoordinator).
 */
export const getAllEnrollmentsAdminView = async (): Promise<EnrollmentDto[]> => {
    try {
        const response = await apiClient.get<EnrollmentDto[]>('/enrollments');
        return response.data;
    } catch (error) {
        console.error('Error fetching all enrollments for admin view:', error);
        // Re-throw to be handled by the calling component, ensuring it's an Error instance
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching enrollments.');
    }
};
// --- END OF NEWLY ADDED FUNCTION ---