// Path: src/features/Learner/LearnerProjects/types/Project.ts
// THIS FILE WILL NOT BE CHANGED

export type ProjectStatus = 'Assigned' | 'Completed';

export interface Project {
  id: number; // Existing type expects a number
  title: string;
  status: ProjectStatus;
  description: string;
  team: string[]; // Existing type expects this
  role?: string;
  startDate: string;
  endDate?: string; // For 'Assigned' status
  completionDate?: string; // For 'Completed' status
  technologies: string[];
}