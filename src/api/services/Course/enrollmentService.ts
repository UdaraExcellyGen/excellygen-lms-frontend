// src/api/services/Course/enrollmentService.ts
import apiClient from '../../apiClient';
import { EnrollmentDto, CreateEnrollmentPayload, UpdateEnrollmentPayload } from '../../../types/course.types';
import { clearCourseCaches } from './learnerCourseService';

// OPTIMIZATION: Add enrollment cache for better performance
let enrollmentCache: {
  userEnrollments: { data: EnrollmentDto[] | null; timestamp: number; isLoading: boolean };
  adminEnrollments: { data: EnrollmentDto[] | null; timestamp: number; isLoading: boolean };
  enrollmentDetails: { [enrollmentId: number]: { data: EnrollmentDto | null; timestamp: number; isLoading: boolean } };
} = {
  userEnrollments: { data: null, timestamp: 0, isLoading: false },
  adminEnrollments: { data: null, timestamp: 0, isLoading: false },
  enrollmentDetails: {}
};

const ENROLLMENT_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Utility function to get current user ID from local storage (if needed, or pass from context)
const getUserIdFromLocalStorage = (): string => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
        const user = JSON.parse(userJson);
        return user.id;
    }
    throw new Error('User ID not found in local storage. User must be logged in.');
};

/**
 * Enroll a user in a course with optimized error handling
 */
export const createEnrollment = async (courseId: number): Promise<EnrollmentDto> => {
    try {
        console.log(`Creating enrollment for course: ${courseId}`);
        
        const userId = getUserIdFromLocalStorage();
        const payload: CreateEnrollmentPayload = {
            userId: userId,
            courseId: courseId,
            status: "active" // Default status
        };
        
        // Add timeout for enrollment request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for enrollment
        
        const response = await apiClient.post<EnrollmentDto>('/enrollments', payload, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // OPTIMIZATION: Clear enrollment cache since new enrollment was created
        enrollmentCache.userEnrollments.data = null;
        enrollmentCache.userEnrollments.timestamp = 0;
        enrollmentCache.adminEnrollments.data = null;
        enrollmentCache.adminEnrollments.timestamp = 0;
        
        // CRITICAL FIX: Invalidate the course data cache as well
        clearCourseCaches();
        
        console.log('Enrollment created successfully, all relevant caches cleared');
        
        return response.data;
    } catch (error: any) {
        console.error('Error creating enrollment:', error);
        
        // Provide better error messages
        if (error.name === 'AbortError') {
            throw new Error('Enrollment request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 409) {
            throw new Error('You are already enrolled in this course.');
        } else if (error.response?.status === 404) {
            throw new Error('Course not found or no longer available.');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to enroll in this course.');
        }
        
        throw error;
    }
};

/**
 * Unenroll a user from a course (logical delete or status update) with optimized error handling
 */
export const deleteEnrollment = async (enrollmentId: number): Promise<void> => {
    try {
        console.log(`Deleting enrollment: ${enrollmentId}`);
        
        // Add timeout for unenrollment request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        await apiClient.delete(`/enrollments/${enrollmentId}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // OPTIMIZATION: Clear enrollment cache since enrollment was deleted
        enrollmentCache.userEnrollments.data = null;
        enrollmentCache.userEnrollments.timestamp = 0;
        enrollmentCache.adminEnrollments.data = null;
        enrollmentCache.adminEnrollments.timestamp = 0;
        
        // Clear specific enrollment from cache
        if (enrollmentCache.enrollmentDetails[enrollmentId]) {
            delete enrollmentCache.enrollmentDetails[enrollmentId];
        }
        
        // CRITICAL FIX: Invalidate the course data cache as well
        clearCourseCaches();
        
        console.log('Enrollment deleted successfully, all relevant caches cleared');
        
    } catch (error: any) {
        console.error('Error deleting enrollment:', error);
        
        // Provide better error messages
        if (error.name === 'AbortError') {
            throw new Error('Unenrollment request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 404) {
            throw new Error('Enrollment not found. You may not be enrolled in this course.');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to unenroll from this course.');
        }
        
        throw error;
    }
};

/**
 * Get a specific enrollment with caching
 */
export const getEnrollmentById = async (enrollmentId: number): Promise<EnrollmentDto> => {
    const now = Date.now();
    
    // Initialize cache for this enrollment if it doesn't exist
    if (!enrollmentCache.enrollmentDetails[enrollmentId]) {
        enrollmentCache.enrollmentDetails[enrollmentId] = { data: null, timestamp: 0, isLoading: false };
    }
    
    const cache = enrollmentCache.enrollmentDetails[enrollmentId];
    
    // Return cached data if fresh
    if (cache.data && (now - cache.timestamp) < ENROLLMENT_CACHE_DURATION && !cache.isLoading) {
        console.log(`Returning cached enrollment details for: ${enrollmentId}`);
        return cache.data;
    }
    
    // Wait for existing request if already loading
    if (cache.isLoading) {
        console.log(`Enrollment details request for ${enrollmentId} in progress, waiting...`);
        let attempts = 0;
        while (cache.isLoading && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (cache.data) return cache.data;
    }
    
    try {
        cache.isLoading = true;
        console.log(`Fetching enrollment details for: ${enrollmentId}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await apiClient.get<EnrollmentDto>(`/enrollments/${enrollmentId}`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Update cache
        cache.data = response.data;
        cache.timestamp = now;
        
        return response.data;
    } catch (error: any) {
        console.error('Error fetching enrollment details:', error);
        
        // Return cached data if available (even if expired)
        if (cache.data) {
            console.log('Returning expired cached enrollment details due to error');
            return cache.data;
        }
        
        throw error;
    } finally {
        cache.isLoading = false;
    }
};

/**
 * Get all enrollments for the current user with caching
 * NOTE: This function maintains the original comment about backend limitations
 */
export const getMyEnrollments = async (): Promise<EnrollmentDto[]> => {
    const now = Date.now();
    const { userEnrollments } = enrollmentCache;
    
    // Return cached data if fresh
    if (userEnrollments.data && (now - userEnrollments.timestamp) < ENROLLMENT_CACHE_DURATION && !userEnrollments.isLoading) {
        console.log('Returning cached user enrollments');
        return userEnrollments.data;
    }
    
    // Wait for existing request if already loading
    if (userEnrollments.isLoading) {
        console.log('User enrollments request in progress, waiting...');
        let attempts = 0;
        while (userEnrollments.isLoading && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (userEnrollments.data) return userEnrollments.data;
    }
    
    try {
        userEnrollments.isLoading = true;
        console.log('Fetching user enrollments...');
        
        // This would require a backend endpoint like /enrollments/user
        // For now, assuming you might have an admin endpoint or similar,
        // or you'd fetch ALL and filter if that's acceptable.
        // If you add [HttpGet("user")] to EnrollmentsController, change this to:
        // const response = await apiClient.get<EnrollmentDto[]>('/enrollments/user');
        // For now, to avoid 404, this will call the admin get all endpoint (if user is admin)
        // or just return empty for a learner. This function might need adjustment based on BE.
        console.warn("getMyEnrollments: This frontend function's backend endpoint might not be correctly exposed for learners.");
        
        // OPTIMIZATION: Try to call a user-specific endpoint first, fallback to empty array
        try {
            const response = await apiClient.get<EnrollmentDto[]>('/enrollments/user');
            userEnrollments.data = response.data;
            userEnrollments.timestamp = now;
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('User enrollments endpoint not available, returning empty array');
                userEnrollments.data = [];
                userEnrollments.timestamp = now;
                return [];
            }
            throw error;
        }
    } catch (error) {
        console.error('Error fetching user enrollments:', error);
        
        // Return cached data if available (even if expired)
        if (userEnrollments.data) {
            console.log('Returning expired cached user enrollments due to error');
            return userEnrollments.data;
        }
        
        // Return empty array as fallback
        return [];
    } finally {
        userEnrollments.isLoading = false;
    }
};

/**
 * Get all enrollments for admin/coordinator view with caching
 * This function fetches all enrollments that administrators or coordinators can view
 */
export const getAllEnrollmentsAdminView = async (): Promise<EnrollmentDto[]> => {
    const now = Date.now();
    const { adminEnrollments } = enrollmentCache;
    
    // Return cached data if fresh
    if (adminEnrollments.data && (now - adminEnrollments.timestamp) < ENROLLMENT_CACHE_DURATION && !adminEnrollments.isLoading) {
        console.log('Returning cached admin enrollments');
        return adminEnrollments.data;
    }
    
    // Wait for existing request if already loading
    if (adminEnrollments.isLoading) {
        console.log('Admin enrollments request in progress, waiting...');
        let attempts = 0;
        while (adminEnrollments.isLoading && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (adminEnrollments.data) return adminEnrollments.data;
    }
    
    try {
        adminEnrollments.isLoading = true;
        console.log('Fetching admin enrollments...');
        
        // This endpoint should return all enrollments for admin/coordinator view
        // The backend endpoint /enrollments needs to handle this logic for admin/coordinator roles
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await apiClient.get<EnrollmentDto[]>('/enrollments', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Update cache
        adminEnrollments.data = response.data;
        adminEnrollments.timestamp = now;
        
        console.log(`Fetched ${response.data.length} enrollments for admin view`);
        
        return response.data;
    } catch (error: any) {
        console.error('Error fetching admin enrollments:', error);
        
        // Return cached data if available (even if expired)
        if (adminEnrollments.data) {
            console.log('Returning expired cached admin enrollments due to error');
            return adminEnrollments.data;
        }
        
        // Provide better error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to view all enrollments.');
        } else if (error.response?.status === 404) {
            throw new Error('Enrollments endpoint not found.');
        }
        
        throw error;
    } finally {
        adminEnrollments.isLoading = false;
    }
};

/**
 * Update enrollment status (e.g., to 'completed' or 'withdrawn') with cache invalidation
 */
export const updateEnrollmentStatus = async (enrollmentId: number, status: string): Promise<EnrollmentDto> => {
    try {
        console.log(`Updating enrollment ${enrollmentId} status to: ${status}`);
        
        const payload: UpdateEnrollmentPayload = { status };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await apiClient.put<EnrollmentDto>(`/enrollments/${enrollmentId}`, payload, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // OPTIMIZATION: Update cache with new data
        if (enrollmentCache.enrollmentDetails[enrollmentId]) {
            enrollmentCache.enrollmentDetails[enrollmentId].data = response.data;
            enrollmentCache.enrollmentDetails[enrollmentId].timestamp = Date.now();
        }
        
        // Clear user and admin enrollments cache since status changed
        enrollmentCache.userEnrollments.data = null;
        enrollmentCache.userEnrollments.timestamp = 0;
        enrollmentCache.adminEnrollments.data = null;
        enrollmentCache.adminEnrollments.timestamp = 0;
        
        console.log('Enrollment status updated successfully, cache updated');
        
        return response.data;
    } catch (error: any) {
        console.error('Error updating enrollment status:', error);
        
        // Provide better error messages
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
        } else if (error.response?.status === 404) {
            throw new Error('Enrollment not found.');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to update this enrollment.');
        }
        
        throw error;
    }
};

/**
 * Clear enrollment caches - useful for forcing refresh
 */
export const clearEnrollmentCaches = () => {
    enrollmentCache.userEnrollments = { data: null, timestamp: 0, isLoading: false };
    enrollmentCache.adminEnrollments = { data: null, timestamp: 0, isLoading: false };
    enrollmentCache.enrollmentDetails = {};
    console.log('Enrollment caches cleared');
};

/**
 * Preload user enrollments
 */
export const preloadUserEnrollments = () => {
    getMyEnrollments().catch(() => {
        // Silently handle errors for preload
    });
};

/**
 * Preload admin enrollments
 */
export const preloadAdminEnrollments = () => {
    getAllEnrollmentsAdminView().catch(() => {
        // Silently handle errors for preload
    });
};