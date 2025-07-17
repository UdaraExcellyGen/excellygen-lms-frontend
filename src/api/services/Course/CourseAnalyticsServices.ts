// src/api/services/Course/CourseAnalyticsServices.ts
import {
  ApiEnrollmentData,
  ApiCoordinatorCourse,
  ApiCourseQuiz,
  ApiMarkRangeData,
  ApiCourseCategory,
  EnrollmentStatus,
  EnrollmentAnalyticsResponse,
  QuizPerformanceResponse,
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

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (activeRole) {
    headers.set('X-Active-Role', activeRole);
  }
  
  if (import.meta.env.DEV) {
    console.log('[CourseAnalyticsServices] Requesting URL:', url);
    console.log('[CourseAnalyticsServices] Token used:', token ? 'Token Present' : 'No Token');
    console.log('[CourseAnalyticsServices] Active Role Header:', activeRole);
  }

  const response = await fetch(url, { ...options, headers: headers });

  if (!response.ok) {
    if (response.status === 401) {
      console.error('[CourseAnalyticsServices] Unauthorized access (401). Token or Role issue?');
    }
    const errorData = await response.text();
    throw new Error(`[CourseAnalyticsServices] API request failed (${url}) with status ${response.status}: ${errorData}`);
  }
  return response.json();
};

// Enhanced enrollment analytics with category and status filtering
export const getEnrollmentAnalytics = async (
  categoryId?: number | null,
  status: EnrollmentStatus = EnrollmentStatus.ALL
): Promise<EnrollmentAnalyticsResponse> => {
  const params = new URLSearchParams();
  
  if (categoryId) {
    params.append('categoryId', categoryId.toString());
  }
  
  if (status !== EnrollmentStatus.ALL) {
    params.append('status', status);
  }

  const url = `${API_BASE_URL}/coordinator-analytics/enrollments${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchCoordinatorAnalyticsWithAuth(url);
};

// Get all course categories for filtering
export const getCourseCategories = async (): Promise<ApiCourseCategory[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/categories`);
};

// Enhanced coordinator courses - only courses created by current coordinator
export const getCoordinatorCourses = async (
  categoryId?: number | null
): Promise<ApiCoordinatorCourse[]> => {
  const params = new URLSearchParams();
  
  if (categoryId) {
    params.append('categoryId', categoryId.toString());
  }

  const url = `${API_BASE_URL}/coordinator-analytics/courses${params.toString() ? `?${params.toString()}` : ''}`;
  return fetchCoordinatorAnalyticsWithAuth(url);
};

// Get quizzes for a specific course (only coordinator's courses)
export const getQuizzesForCourse = async (courseId: number): Promise<ApiCourseQuiz[]> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/courses/${courseId}/quizzes`);
};

// Enhanced quiz performance with better mark intervals
export const getQuizPerformance = async (quizId: number): Promise<QuizPerformanceResponse> => {
  return fetchCoordinatorAnalyticsWithAuth(`${API_BASE_URL}/coordinator-analytics/quizzes/${quizId}/performance`);
};

// Utility function to truncate course names for display
export const truncateCourseName = (courseName: string, maxLength: number = 25): string => {
  if (courseName.length <= maxLength) {
    return courseName;
  }
  return courseName.substring(0, maxLength - 3) + '...';
};

// Process enrollment data for chart display
export const processEnrollmentDataForChart = (
  data: ApiEnrollmentData[],
  status: EnrollmentStatus
): any[] => {
  return data.map(item => {
    let count = 0;
    switch (status) {
      case EnrollmentStatus.ALL:
        count = item.totalEnrollments;
        break;
      case EnrollmentStatus.ONGOING:
        count = item.ongoingEnrollments;
        break;
      case EnrollmentStatus.COMPLETED:
        count = item.completedEnrollments;
        break;
    }

    return {
      course: truncateCourseName(item.course),
      fullCourseName: item.course,
      count: count,
      categoryName: item.categoryName,
      coordinatorName: item.coordinatorName,
      courseId: item.courseId
    };
  });
};

// Process quiz performance data for better interval display
export const processQuizPerformanceData = (data: ApiMarkRangeData[]): any[] => {
  return data.map(item => ({
    range: item.range,
    count: item.count,
    percentage: item.percentage,
    minMark: item.minMark,
    maxMark: item.maxMark
  }));
};