import { FC } from 'react';

export interface Skill {
  name: string;
}

export interface Certification {
  name: string;
  issueDate: string;
  status: 'Completed' | 'In Progress';
}

export interface Badge {
  name: string;
  icon: FC<{ className?: string }>;
  color: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  status: 'Assigned' | 'Completed';
  startDate: string;
  endDate?: string;
  role: string;
  technologies: string[];
}

export interface ProfileData {
  id?: string;  // Added ID field
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  bio: string;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  rewards: {
    totalBadges: number;
    thisMonth: number;
    level: string;
    recentBadges: Badge[];
  };
}