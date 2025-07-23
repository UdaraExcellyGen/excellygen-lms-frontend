export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string; // 'active' | 'inactive'
  totalCourses: number;
  isDeleted: boolean;
  deletedAt?: string;
  restoreAt?: string; // Expiration for the 30-day recovery period
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