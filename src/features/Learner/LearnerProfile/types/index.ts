import { FC } from 'react';

export interface Skill {
  name: string;
  id?: string;
  addedDate?: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization?: string;
  description?: string;
  issueDate: string;
  status: string;
  credentialId?: string;
  imageUrl?: string;
}

export interface Badge {
  id?: string;
  name: string;
  icon?: FC<{ className?: string }>;
  color?: string;
  description: string;
  imageUrl?: string;
  earnedDate?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  role: string;
  technologies: string[];
}

export interface ProfileData {
  id: string;
  name: string;
  role?: string;
  jobRole?: string;
  email: string;
  phone: string;
  department: string;
  about?: string;
  avatar?: string;
  roles?: string[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  rewards: {
    totalBadges: number;
    thisMonth: number;
    recentBadges: Badge[];
  };
}