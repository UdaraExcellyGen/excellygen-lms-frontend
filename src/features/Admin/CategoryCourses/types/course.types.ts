// src/features/Admin/CategoryCourses/types/course.types.ts
export interface Course {
  id: number; // Course ID is a number
  title: string;
  description: string;
  status: string;
  isInactive: boolean; // Field to show if course is active or not
  createdAt: string;
  creator: {
    name: string;
  } | null;
  lessons: any[]; // lessons can be an empty array
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
}

export interface UpdateCourseAdminDto {
  title: string;
  description: string;
}