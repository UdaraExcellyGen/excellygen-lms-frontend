// src/api/analyticsApi.ts
import { createApiClient, handleApiError } from '../utils/apiConfig';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CourseCategoryDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
}

export interface EnrollmentDataItem {
  courseName: string;
  enrollmentCount: number;
}

export interface EnrollmentAnalyticsDto {
  enrollmentData: EnrollmentDataItem[];
  categories: CourseCategoryDto[];
}

export interface CourseAvailabilityDto {
  availabilityData: ChartData[];
}

export interface UserDistributionDto {
  distributionData: ChartData[];
}

export interface DashboardAnalyticsDto {
  enrollmentAnalytics: EnrollmentAnalyticsDto;
  courseAvailability: CourseAvailabilityDto;
  userDistribution: UserDistributionDto;
}

const apiClient = createApiClient();

export const getDashboardAnalytics = async (categoryId?: string): Promise<DashboardAnalyticsDto> => {
  try {
    const response = await apiClient.get('/admin/analytics/dashboard', {
      params: categoryId ? { categoryId } : undefined
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getEnrollmentAnalytics = async (categoryId?: string | null): Promise<EnrollmentAnalyticsDto> => {
  try {
    const response = await apiClient.get('/admin/analytics/enrollment', {
      params: categoryId ? { categoryId } : undefined
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCourseAvailabilityAnalytics = async (): Promise<CourseAvailabilityDto> => {
  try {
    const response = await apiClient.get('/admin/analytics/course-availability');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Update or add if missing
export const getUserDistributionAnalytics = async (): Promise<UserDistributionDto> => {
  try {
    const response = await apiClient.get('/admin/analytics/user-distribution');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};