// src/features/Admin/CategoryCourses/types/course.types.ts
// ENTERPRISE OPTIMIZED: Comprehensive type definitions with enhanced validation

// ENTERPRISE: Core course interface with comprehensive fields
export interface Course {
  /** Unique course identifier */
  id: number;
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Current status of the course */
  status: CourseStatus;
  /** Whether the course is currently inactive */
  isInactive: boolean;
  /** ISO string of when the course was created */
  createdAt: string;
  /** Course creator information */
  creator: CourseCreator | null;
  /** Array of lessons associated with this course */
  lessons: CourseLesson[];
  /** Optional course metadata */
  metadata?: CourseMetadata;
}

// ENTERPRISE: Enhanced course status with comprehensive states
export type CourseStatus = 
  | 'draft' 
  | 'active' 
  | 'inactive' 
  | 'archived' 
  | 'under_review'
  | 'published';

// ENTERPRISE: Course creator interface with detailed information
export interface CourseCreator {
  /** Creator's display name */
  name: string;
  /** Optional creator ID for reference */
  id?: string;
  /** Optional creator email */
  email?: string;
  /** Optional creator role */
  role?: string;
}

// ENTERPRISE: Course lesson interface for better structure
export interface CourseLesson {
  /** Unique lesson identifier */
  id: number;
  /** Lesson title */
  title: string;
  /** Lesson description */
  description?: string;
  /** Lesson order within the course */
  order: number;
  /** Lesson duration in minutes */
  duration?: number;
  /** Whether the lesson is published */
  isPublished: boolean;
  /** Lesson content type */
  contentType?: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
}

// ENTERPRISE: Course metadata for additional information
export interface CourseMetadata {
  /** Total number of enrolled students */
  enrollmentCount?: number;
  /** Average course rating */
  averageRating?: number;
  /** Total number of ratings */
  ratingCount?: number;
  /** Estimated completion time in hours */
  estimatedHours?: number;
  /** Course difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Course tags for categorization */
  tags?: string[];
  /** Last updated timestamp */
  lastUpdated?: string;
}

// ENTERPRISE: Course category interface with enhanced fields
export interface CourseCategory {
  /** Unique category identifier */
  id: string;
  /** Category title */
  title: string;
  /** Category description */
  description: string;
  /** Optional category icon */
  icon?: string;
  /** Category status */
  status?: 'active' | 'inactive';
  /** Number of courses in this category */
  courseCount?: number;
  /** Category creation date */
  createdAt?: string;
  /** Category last update date */
  updatedAt?: string;
}

// ENTERPRISE: DTO for updating course via admin interface
export interface UpdateCourseAdminDto {
  /** Updated course title */
  title: string;
  /** Updated course description */
  description: string;
  /** Optional status update */
  status?: CourseStatus;
  /** Optional metadata updates */
  metadata?: Partial<CourseMetadata>;
}

// ENTERPRISE: DTO for creating new courses
export interface CreateCourseDto {
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Category ID where the course belongs */
  categoryId: string;
  /** Initial course status */
  status?: CourseStatus;
  /** Course metadata */
  metadata?: Partial<CourseMetadata>;
}

// ENTERPRISE: Search and filter parameters
export interface CourseSearchParams {
  /** Search query for title/description */
  query?: string;
  /** Filter by status */
  status?: CourseStatus | CourseStatus[];
  /** Filter by category */
  categoryId?: string;
  /** Filter by creator */
  creatorId?: string;
  /** Sort field */
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'enrollmentCount' | 'rating';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Pagination - page number */
  page?: number;
  /** Pagination - items per page */
  limit?: number;
  /** Include inactive courses */
  includeInactive?: boolean;
}

// ENTERPRISE: API response wrapper for paginated results
export interface CourseListResponse {
  /** Array of courses */
  courses: Course[];
  /** Total number of courses matching criteria */
  totalCount: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more pages */
  hasNext: boolean;
  /** Whether there are previous pages */
  hasPrevious: boolean;
}

// ENTERPRISE: Course statistics for analytics
export interface CourseStatistics {
  /** Total number of courses */
  totalCourses: number;
  /** Number of active courses */
  activeCourses: number;
  /** Number of inactive courses */
  inactiveCourses: number;
  /** Number of draft courses */
  draftCourses: number;
  /** Total enrollment across all courses */
  totalEnrollments: number;
  /** Average course rating */
  averageRating: number;
  /** Most popular course */
  mostPopularCourse?: Course;
  /** Recently created courses */
  recentCourses?: Course[];
}

// ENTERPRISE: Validation result interface
export interface CourseValidationResult {
  /** Whether the course data is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: CourseValidationError[];
  /** Array of validation warnings */
  warnings: CourseValidationWarning[];
}

// ENTERPRISE: Validation error interface
export interface CourseValidationError {
  /** Field that has the error */
  field: keyof Course | string;
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
}

// ENTERPRISE: Validation warning interface
export interface CourseValidationWarning {
  /** Field that has the warning */
  field: keyof Course | string;
  /** Warning message */
  message: string;
  /** Warning code for programmatic handling */
  code: string;
  /** Suggested action */
  suggestion?: string;
}

// ENTERPRISE: Utility types for enhanced type safety
export type CourseId = Course['id'];
export type CategoryId = CourseCategory['id'];
export type CreatorId = CourseCreator['id'];
export type LessonId = CourseLesson['id'];

// ENTERPRISE: Partial types for flexible updates
export type PartialCourse = Partial<Course>;
export type PartialCourseCategory = Partial<CourseCategory>;
export type PartialCourseLesson = Partial<CourseLesson>;

// ENTERPRISE: Required fields for course creation
export type RequiredCourseFields = Pick<Course, 'title' | 'description'>;
export type RequiredCategoryFields = Pick<CourseCategory, 'title' | 'description'>;

// ENTERPRISE: Omit sensitive fields when exposing to public API
export type PublicCourse = Omit<Course, 'creator'> & {
  creatorName?: string;
};

// ENTERPRISE: Course with computed fields for display
export interface EnhancedCourse extends Course {
  /** Computed: formatted creation date */
  formattedCreatedAt: string;
  /** Computed: course duration in hours */
  totalDuration: number;
  /** Computed: completion percentage if user is enrolled */
  completionPercentage?: number;
  /** Computed: whether user can enroll */
  canEnroll: boolean;
  /** Computed: whether user is already enrolled */
  isEnrolled?: boolean;
}

// ENTERPRISE: Type guards for runtime type checking
export const isCourse = (obj: any): obj is Course => {
  return obj && 
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.isInactive === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    Array.isArray(obj.lessons);
};

export const isCourseCategory = (obj: any): obj is CourseCategory => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string';
};

// ENTERPRISE: Constants for validation and defaults
export const COURSE_CONSTANTS = {
  /** Maximum length for course title */
  MAX_TITLE_LENGTH: 200,
  /** Maximum length for course description */
  MAX_DESCRIPTION_LENGTH: 2000,
  /** Minimum length for course title */
  MIN_TITLE_LENGTH: 3,
  /** Default course status */
  DEFAULT_STATUS: 'draft' as CourseStatus,
  /** Maximum number of lessons per course */
  MAX_LESSONS_PER_COURSE: 100,
  /** Valid course statuses */
  VALID_STATUSES: ['draft', 'active', 'inactive', 'archived', 'under_review', 'published'] as CourseStatus[],
  /** Valid content types for lessons */
  VALID_CONTENT_TYPES: ['video', 'text', 'quiz', 'assignment', 'interactive'],
  /** Valid difficulty levels */
  VALID_DIFFICULTY_LEVELS: ['beginner', 'intermediate', 'advanced'],
} as const;