// src/features/Learner/LearnerCv/types/types.ts

// Personal Information structure for the CV header
export interface PersonalInfo {
  name: string;
  position: string; 
  email: string;
  phone: string;
  department: string;
  photo?: string | null; 
  summary: string;    
}

// Project structure for the CV
export interface ProfileProject { 
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  completionDate?: string | null; 
  status: string; 
}

// Course/Certification structure for the CV
export interface ProfileCourse { 
  title: string;
  provider: string; 
  completionDate: string;
  duration?: string | null;
  certificate: boolean; 
}

// The main data structure for the CV page
export interface UserData {
  personalInfo: PersonalInfo;
  projects: ProfileProject[];
  courses: ProfileCourse[]; 
  skills: string[];        
}