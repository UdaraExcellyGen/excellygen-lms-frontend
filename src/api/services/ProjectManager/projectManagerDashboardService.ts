// Path: src/api/services/ProjectManager/projectManagerDashboardService.ts

import apiClient from '../../apiClient';

export interface ProjectManagerDashboardStats {
  projects: {
    total: number;
    active: number;
    withEmployees: number;
  };
  employees: {
    total: number;
    onProjects: number;
    available: number;
    fullyUtilized: number;
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
 * Now uses the backend dashboard/stats endpoint instead of manual calculation
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
    console.log('Fetching Project Manager dashboard stats from backend...');
    
    // Create and store the promise - USE THE BACKEND ENDPOINT
    statsPromise = fetchStatsFromBackend();
    const result = await statsPromise;
    
    // Cache the result
    statsCache = {
      data: result,
      timestamp: now
    };
    
    console.log('PM dashboard stats from backend:', result);
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
 * NEW: Fetch stats directly from the backend dashboard endpoint
 * This uses the properly calculated stats from EmployeeAssignmentService
 */
const fetchStatsFromBackend = async (): Promise<ProjectManagerDashboardStats> => {
  try {
    console.log('Calling backend dashboard/stats endpoint...');
    
    // Call the backend dashboard stats endpoint
    const response = await apiClient.get('/project-manager/dashboard/stats');
    
    const backendStats = response.data;
    console.log('Backend dashboard response:', backendStats);
    
    // The backend returns ProjectManagerDashboardStatsDto which matches our interface
    return {
      projects: {
        total: backendStats.projects.total,
        active: backendStats.projects.active,
        withEmployees: backendStats.projects.withEmployees
      },
      employees: {
        total: backendStats.employees.total,
        onProjects: backendStats.employees.onProjects,  // This is the correct count!
        available: backendStats.employees.available,
        fullyUtilized: backendStats.employees.fullyUtilized
      },
      technologies: {
        total: backendStats.technologies.total,
        active: backendStats.technologies.active
      }
    };
    
  } catch (error) {
    console.error('Error calling backend dashboard stats:', error);
    
    // Fallback to manual calculation if backend fails
    console.log('Falling back to manual calculation...');
    return await fetchStatsManually();
  }
};

/**
 * Fallback manual calculation (keeping the old logic as backup)
 */
const fetchStatsManually = async (): Promise<ProjectManagerDashboardStats> => {
  const { getAllProjects, getProjectTechnologies } = await import('../../projectManagerApi');
  const { employeeApi } = await import('./employeeAssignmentService');
  
  // Fetch all data in parallel for better performance
  const [allProjects, allEmployees, allTechnologies] = await Promise.all([
    getAllProjects().catch(err => {
      console.error('Error fetching projects:', err);
      return [];
    }),
    employeeApi.getAllEmployees().catch(err => {
      console.error('Error fetching employees:', err);
      return [];
    }),
    getProjectTechnologies().catch(err => {
      console.error('Error fetching technologies:', err);
      return [];
    })
  ]);

  console.log('Manual calculation data fetched');

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
  
  // Count employees who have any workload (assigned to projects)
  const employeesOnProjects = allEmployees.filter(employee => 
    employee.currentWorkloadPercentage > 0
  ).length;
  
  // Available employees (active but not on projects)
  const availableEmployees = activeEmployees - employeesOnProjects;
  
  // Fully utilized employees (>= 80% workload)
  const fullyUtilizedEmployees = allEmployees.filter(employee => 
    employee.currentWorkloadPercentage >= 80
  ).length;

  // Calculate technology statistics
  const totalTechnologies = allTechnologies.length;
  const activeTechnologies = allTechnologies.filter(tech => 
    tech.status === 'active'
  ).length;

  return {
    projects: {
      total: totalProjects,
      active: activeProjects,
      withEmployees: 0 // We don't have this data in manual calculation
    },
    employees: {
      total: totalEmployees,
      onProjects: employeesOnProjects,
      available: availableEmployees,
      fullyUtilized: fullyUtilizedEmployees
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
 * Helper functions for individual stats (using backend when possible)
 */
export const getProjectStats = async () => {
  try {
    const stats = await getDashboardStats();
    return stats.projects;
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return { total: 0, active: 0, withEmployees: 0 };
  }
};

export const getEmployeeStats = async () => {
  try {
    const stats = await getDashboardStats();
    return stats.employees;
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    return { total: 0, onProjects: 0, available: 0, fullyUtilized: 0 };
  }
};

export const getTechnologyStats = async () => {
  try {
    const stats = await getDashboardStats();
    return stats.technologies;
  } catch (error) {
    console.error('Error fetching technology stats:', error);
    return { total: 0, active: 0 };
  }
};