export interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  createdAtFormatted: string;
  creatorId: string;
  categoryId: string;
  estimatedTime: number;
  coursePoints?: number;
  thumbnailImagePath?: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  lessons?: {
    id: string;
    lessonName: string;
  }[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses: number;
  isDeleted: boolean;
}

export interface UpdateCourseAdminDto {
  title: string;
  description: string;
  estimatedTime?: number;
  coursePoints?: number;
}