export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  createdAtFormatted?: string;
  lessons: number;
  creator?: {
    id: string;
    name: string;
  };
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses: number;
}

export interface UpdateCourseAdminDto {
  title: string;
  description: string;
}