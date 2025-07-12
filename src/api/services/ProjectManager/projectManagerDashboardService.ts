// Path: src/api/services/ProjectManager/projectManagerDashboardService.ts

import { getAllProjects, getProjectTechnologies } from '../../projectManagerApi';
import { employeeApi } from './employeeAssignmentService';

export interface ProjectManagerDashboardStats {
  projects: {
    total: number;
    active: number;
  };
  employees: {
    total: number;
    active: number;
  };
  technologies: {
    total: number;
    active: number;
  };
}

export interface PMNotification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

// Cache for dashboard stats to prevent unnecessary API calls
let statsCache: {
  data: ProjectManagerDashboardStats | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

// Cache TTL in milliseconds (2 minutes)
const CACHE_TTL = 2 * 60 * 1000;

// Flag to prevent concurrent requests
let isStatsLoading = false;
let statsPromise: Promise<ProjectManagerDashboardStats> | null = null;

/**
 * Fetches dashboard statistics for Project Manager
 * Matches Admin dashboard pattern for consistency
 * Includes caching and request deduplication
 */
export const getDashboardStats = async (): Promise<ProjectManagerDashboardStats> => {
  // Check cache first
  const now = Date.now();
  if (statsCache.data && (now - statsCache.timestamp) < CACHE_TTL) {
    console.log('Returning cached PM dashboard stats');
    return statsCache.data;
  }

  // If already loading, return the existing promise
  if (isStatsLoading && statsPromise) {
    console.log('Dashboard stats request already in progress, waiting...');
    return statsPromise;
  }

  try {
    isStatsLoading = true;
    console.log('Fetching Project Manager dashboard stats...');
    
    // Create and store the promise
    statsPromise = fetchStatsFromAPI();
    const result = await statsPromise;
    
    // Cache the result
    statsCache = {
      data: result,
      timestamp: now
    };
    
    console.log('Final PM dashboard stats:', result);
    return result;

  } catch (error) {
    console.error('Error fetching Project Manager dashboard stats:', error);
    // Clear the promise on error so retry can work
    statsPromise = null;
    throw error;
  } finally {
    isStatsLoading = false;
    // Clear the promise after completion
    statsPromise = null;
  }
};

/**
 * Internal function to fetch stats from API
 */
const fetchStatsFromAPI = async (): Promise<ProjectManagerDashboardStats> => {
  // Fetch all data in parallel for better performance
  const [allProjects, allEmployees, allTechnologies] = await Promise.all([
    getAllProjects().catch(err => {
      console.error('Error fetching projects:', err);
      return [];
    }),
    employeeApi.getAvailableEmployees().catch(err => {
      console.error('Error fetching employees:', err);
      return [];
    }),
    getProjectTechnologies().catch(err => {
      console.error('Error fetching technologies:', err);
      return [];
    })
  ]);

  console.log('Dashboard data fetched successfully');

  // Calculate project statistics
  const totalProjects = allProjects.length;
  const activeProjects = allProjects.filter(project => 
    project.status === 'Active'
  ).length;

  // Calculate employee statistics  
  const totalEmployees = allEmployees.length;
  const activeEmployees = allEmployees.filter(employee => 
    employee.status === 'active'
  ).length;

  // Calculate technology statistics
  const totalTechnologies = allTechnologies.length;
  const activeTechnologies = allTechnologies.filter(tech => 
    tech.status === 'active'
  ).length;

  return {
    projects: {
      total: totalProjects,
      active: activeProjects
    },
    employees: {
      total: totalEmployees,
      active: activeEmployees
    },
    technologies: {
      total: totalTechnologies,
      active: activeTechnologies
    }
  };
};

/**
 * Fetches dashboard notifications for Project Manager
 * Mock data for now - can be replaced with real API later
 */
export const getDashboardNotifications = async (): Promise<PMNotification[]> => {
  try {
    // Mock notifications - replace with real API when available
    return [
      {
        id: 1,
        text: "New project 'Website Redesign' has been created",
        time: "2 hours ago",
        isNew: true
      },
      {
        id: 2,
        text: "Mobile App Development deadline in 3 days",
        time: "5 hours ago",
        isNew: true
      },
      {
        id: 3,
        text: "Employee request for Database Optimization project",
        time: "1 day ago",
        isNew: false
      }
    ];
  } catch (error) {
    console.error('Error fetching PM notifications:', error);
    return [];
  }
};

/**
 * Helper function to clear the cache
 * Useful for forcing fresh data after updates
 */
export const clearStatsCache = () => {
  statsCache = {
    data: null,
    timestamp: 0
  };
  console.log('PM dashboard stats cache cleared');
};

/**
 * Helper function to get project statistics only
 */
export const getProjectStats = async () => {
  try {
    const allProjects = await getAllProjects();
    return {
      total: allProjects.length,
      active: allProjects.filter(project => project.status === 'Active').length
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return { total: 0, active: 0 };
  }
};

/**
 * Helper function to get employee statistics only
 */
export const getEmployeeStats = async () => {
  try {
    const allEmployees = await employeeApi.getAvailableEmployees();
    return {
      total: allEmployees.length,
      active: allEmployees.filter(employee => employee.status === 'active').length
    };
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    return { total: 0, active: 0 };
  }
};

/**
 * Helper function to get technology statistics only
 */
export const getTechnologyStats = async () => {
  try {
    const allTechnologies = await getProjectTechnologies();
    return {
      total: allTechnologies.length,
      active: allTechnologies.filter(tech => tech.status === 'active').length
    };
  } catch (error) {
    console.error('Error fetching technology stats:', error);
    return { total: 0, active: 0 };
  }
};