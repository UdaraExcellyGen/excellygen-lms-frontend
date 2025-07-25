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
  totalCourses?: number;
}

export interface EnrollmentChartItem {
  id: string; 
  name: string;
  inProgress: number;
  completed: number;
}

export interface EnrollmentAnalyticsDto {
  enrollmentData: EnrollmentChartItem[];
  categories: CourseCategoryDto[];
}

export interface EnrollmentKpiDto {
  mostPopularCategoryName: string | null;
  mostPopularCategoryEnrollments: number;
  mostPopularCourseName: string | null;
  mostPopularCourseEnrollments: number;
  // --- NEW PROPERTIES ---
  mostCompletedCourseName: string | null;
  mostCompletedCourseCount: number;
}

export interface KpiSummaryDto {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface CourseAvailabilityDto {
  availabilityData: ChartData[];
}

export interface UserDistributionItem {
    role: string;
    active: number;
    inactive: number;
}

export interface UserDistributionDto {
  distributionData: UserDistributionItem[];
}


// API Client and Functions

const apiClient = createApiClient();

export const getKpiSummary = async (): Promise<KpiSummaryDto> => {
    try {
        const response = await apiClient.get('/admin/analytics/kpi-summary');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getEnrollmentKpis = async (): Promise<EnrollmentKpiDto> => {
    try {
        const response = await apiClient.get('/admin/analytics/enrollment-kpis');
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

export const getUserDistributionAnalytics = async (): Promise<UserDistributionDto> => {
  try {
    const response = await apiClient.get('/admin/analytics/user-distribution');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};