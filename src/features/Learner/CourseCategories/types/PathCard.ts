// src/features/Learner/CourseCategories/types/PathCard.ts
import { ReactNode } from 'react';

export interface PathCard {
  id: string; // Added id, as backend category has it and it's used for navigation
  title: string;
  icon: ReactNode;
  description: string;
  totalCourses: number;
  activeUsers: number; // Retained as per your original UI/requirement
  avgDuration: string; // Retained as per your original UI/requirement
}