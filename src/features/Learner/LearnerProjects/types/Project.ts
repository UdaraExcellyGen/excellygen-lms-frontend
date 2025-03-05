export type ProjectStatus = 'Assigned' | 'Completed';

export interface Project {
  id: number;
  title: string;
  status: ProjectStatus;
  description: string;
  team: string[];
  role?: string; 
  startDate: string;
  endDate?: string;
  completionDate?: string;
  technologies: string[];
}