// roleMapping.ts - Add this to your frontend code

import { UserRole } from '../types/auth.types';

/**
 * Converts backend role string to frontend UserRole enum
 * This helps handle inconsistencies in role casing/formatting between backend and frontend
 * 
 * @param role Backend role string
 * @returns Matching UserRole enum value
 */
export const mapBackendRoleToEnum = (role: string): UserRole => {
  // Normalize the role string for case-insensitive comparison
  const normalizedRole = role.toLowerCase();
  
  if (normalizedRole === 'admin') {
    return UserRole.Admin;
  } else if (normalizedRole === 'learner') {
    return UserRole.Learner;
  } else if (normalizedRole === 'coordinator' || normalizedRole === 'coursecoordinator' || normalizedRole === 'course_coordinator') {
    return UserRole.CourseCoordinator;
  } else if (normalizedRole === 'project_manager' || normalizedRole === 'projectmanager') {
    return UserRole.ProjectManager;
  }
  
  // Default fallback
  console.warn(`Unknown role format: "${role}", defaulting to Learner`);
  return UserRole.Learner;
};

/**
 * Converts frontend UserRole enum to properly formatted backend role string
 * 
 * @param role UserRole enum value
 * @returns Properly formatted backend role string
 */
export const mapEnumToBackendRole = (role: UserRole): string => {
  switch (role) {
    case UserRole.Admin:
      return 'Admin';
    case UserRole.Learner:
      return 'Learner';
    case UserRole.CourseCoordinator:
      return 'CourseCoordinator';
    case UserRole.ProjectManager:
      return 'ProjectManager';
    default:
      return 'Learner';
  }
};

/**
 * Maps an array of backend role strings to frontend UserRole enum values
 * 
 * @param roles Array of backend role strings
 * @returns Array of UserRole enum values
 */
export const mapBackendRolesToEnums = (roles: string[]): UserRole[] => {
  return roles.map(mapBackendRoleToEnum);
};

/**
 * Maps an array of frontend UserRole enum values to properly formatted backend role strings
 * 
 * @param roles Array of UserRole enum values
 * @returns Array of properly formatted backend role strings
 */
export const mapEnumsToBackendRoles = (roles: UserRole[]): string[] => {
  return roles.map(mapEnumToBackendRole);
};