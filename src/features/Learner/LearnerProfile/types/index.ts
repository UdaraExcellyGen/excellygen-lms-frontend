import { FC } from 'react';

// This is the new, correct Badge type from the Badges & Rewards page.
export interface Badge {
  id: string;
  title: string; // Changed from name to title to match new service
  description: string;
  howToEarn: string;
  iconPath: string; // Changed from icon to iconPath
  currentProgress: number;
  targetProgress: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  dateEarned?: string;
  category: string;
  color: string;
}

export interface Skill {
  name: string;
  id?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  status: string;
  imageUrl?: string;
  description?: string;
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