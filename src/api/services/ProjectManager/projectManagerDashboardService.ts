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

/**
 * Fetches dashboard statistics for Project Manager
 * Matches Admin dashboard pattern for consistency
 */
export const getDashboardStats = async (): Promise<ProjectManagerDashboardStats> => {
  try {
    console.log('Fetching Project Manager dashboard stats...');
    
    // Fetch all data in parallel for better performance
    const [allProjects, allEmployees, allTechnologies] = await Promise.all([
      getAllProjects(), // Get all projects
      employeeApi.getAvailableEmployees(), // Get all employees (using PM API)
      getProjectTechnologies() // Get all technologies
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

    const result = {
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

    console.log('Final PM dashboard stats:', result);
    return result;

  } catch (error) {
    console.error('Error fetching Project Manager dashboard stats:', error);
    throw error; // Let the component handle the error
  }
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
    const allUsers = await getAllUsers();
    return {
      total: allUsers.length,
      active: allUsers.filter(user => user.status === 'active').length
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