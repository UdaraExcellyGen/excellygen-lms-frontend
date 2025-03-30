export interface Category {
    id: string;
    title: string;
    description: string;
    totalCourses: number;
    icon: string;
    status: 'active' | 'inactive';
  }