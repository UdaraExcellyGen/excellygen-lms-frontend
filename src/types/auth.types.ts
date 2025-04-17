export enum UserRole {
    Admin = 'Admin',
    Learner = 'Learner',
    CourseCoordinator = 'CourseCoordinator',
    ProjectManager = 'ProjectManager'
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
    department?: string;
    jobRole?: string;
    about?: string;
    avatar?: string;
  }
  
  export interface AuthState {
    user: User | null;
    currentRole: UserRole | null;
    loading: boolean;
    initialized: boolean;
    error: string | null;
  }
  
  export interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    currentRole: string;
  }