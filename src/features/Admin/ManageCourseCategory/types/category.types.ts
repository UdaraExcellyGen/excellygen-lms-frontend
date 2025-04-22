export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses: number;
}

export interface CreateCategoryDto {
  title: string;
  description: string;
  icon: string;
}

export interface UpdateCategoryDto {
  title: string;
  description: string;
  icon: string;
  status: string;
}