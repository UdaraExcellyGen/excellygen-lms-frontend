import apiClient from '../../apiClient';
import {
  ApiEnrollmentData,
  ApiCoordinatorCourse,
  ApiCourseQuiz,
  ApiMarkRangeData,
  ApiCourseCategory,
  EnrollmentStatus,
  OwnershipFilter,
  EnrollmentAnalyticsResponse,
  QuizPerformanceResponse,
  ProcessedEnrollmentData,
} from '../../../features/Coordinator/Analytics/types/analytics';

export const getEnrollmentAnalytics = async (
  categoryId: string | null,
  status: EnrollmentStatus = EnrollmentStatus.ALL,
  ownership: OwnershipFilter = OwnershipFilter.MINE
): Promise<EnrollmentAnalyticsResponse> => {
  const params = new URLSearchParams();
  
  if (categoryId) {
    params.append('categoryId', categoryId);
  }
  params.append('status', status);
  params.append('ownership', ownership);

  const response = await apiClient.get(`/coordinator-analytics/enrollments?${params.toString()}`);
  return response.data;
};

export const getCourseCategories = async (): Promise<ApiCourseCategory[]> => {
  const response = await apiClient.get('/coordinator-analytics/categories');
  return response.data;
};

export const getCoordinatorCourses = async (
  categoryId: string | null,
  ownership: OwnershipFilter = OwnershipFilter.MINE
): Promise<ApiCoordinatorCourse[]> => {
  const params = new URLSearchParams();
  
  if (categoryId) {
    params.append('categoryId', categoryId);
  }
  params.append('ownership', ownership);

  const url = `/coordinator-analytics/courses?${params.toString()}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getQuizzesForCourse = async (courseId: number): Promise<ApiCourseQuiz[]> => {
  const response = await apiClient.get(`/coordinator-analytics/courses/${courseId}/quizzes`);
  return response.data;
};

export const getQuizPerformance = async (quizId: number): Promise<QuizPerformanceResponse> => {
  const response = await apiClient.get(`/coordinator-analytics/quizzes/${quizId}/performance`);
  return response.data;
};

export const truncateCourseName = (courseName: string, maxLength: number = 30): string => {
  if (courseName.length <= maxLength) {
    return courseName;
  }
  return courseName.substring(0, maxLength).trim() + '...';
};

export const processEnrollmentDataForChart = (
  data: ApiEnrollmentData[],
  status: EnrollmentStatus
): ProcessedEnrollmentData[] => {
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
  }).filter(item => item.count > 0);
};