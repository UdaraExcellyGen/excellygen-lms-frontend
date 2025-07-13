// src/services/CourseAnalyticsServices.ts 
import {
  ApiEnrollmentData,
  ApiCoordinatorCourse,
  ApiCourseQuiz,
  ApiMarkRangeData,
} from '../../../features/Coordinator/Analytics/types/analytics'; 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5177/api';

const getAuthTokenForCoordinatorAnalytics = (): string | null => {
  return localStorage.getItem('access_token');
};

const getCurrentRoleForCoordinatorAnalytics = (): string | null => {
  const currentRole = localStorage.getItem('current_role');
  if (currentRole) {
    const roleMap: {[key: string]: string} = {
      'Admin': 'Admin',
      'Project Manager': 'ProjectManager',
      'ProjectManager': 'ProjectManager',
      'Learner': 'Learner',
      'Course Coordinator': 'CourseCoordinator',
      'CourseCoordinator': 'CourseCoordinator'
    };
    return roleMap[currentRole] || currentRole;
  }
  return null;
};

const fetchCoordinatorAnalyticsWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthTokenForCoordinatorAnalytics();
  const activeRole = getCurrentRoleForCoordinatorAnalytics();

  // Use the Headers object
  const headers = new Headers(options.headers); // Initialize with existing headers from options

  headers.set('Content-Type', 'application/json'); // Ensure Content-Type is set

  if (token) {
    headers.set('Authorization', `Bearer ${token}`); // Use .set()
  }

  if (activeRole) {
    headers.set('X-Active-Role', activeRole); // Use .set()
  }
  
  if (import.meta.env.DEV) {
    console.log('[CourseAnalyticsServices] Requesting URL:', url);
    console.log('[CourseAnalyticsServices] Token used:', token ? 'Token Present' : 'No Token');
    console.log('[CourseAnalyticsServices] Active Role Header:', activeRole);
    // For Headers object, might need to iterate to log:
    
  }

  const response = await fetch(url, { ...options, headers: headers }); // Pass the Headers object directly

  if (!response.ok) {
    if (response.status === 401) {
      console.error('[CourseAnalyticsServices] Unauthorized access (401). Token or Role issue?');
    }
    const errorData = await response.text();
    throw new Error(`[CourseAnalyticsServices] API request failed (${url}) with status ${response.status}: ${errorData}`);
  }
  return response.json();
};


export const getEnrollmentAnalytics = async (): Promise<ApiEnrollmentData[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/enrollments`);
};

export const getCoordinatorCourses = async (): Promise<ApiCoordinatorCourse[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/courses`);
};

export const getQuizzesForCourse = async (courseId: number): Promise<ApiCourseQuiz[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/courses/${courseId}/quizzes`);
};

export const getQuizPerformance = async (quizId: number): Promise<ApiMarkRangeData[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/quizzes/${quizId}/performance`);
};