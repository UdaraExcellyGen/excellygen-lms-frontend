// Path: src/api/services/ProjectManager/employeeAssignmentService.ts

import apiClient from '../../apiClient';
import { 
  Employee, 
  Project, 
  EmployeeAssignment,
  CreateEmployeeAssignmentRequest,
  BulkAssignEmployeesRequest,
  EmployeeFilter,
  EmployeeWorkload,
  UpdateEmployeeAssignmentRequest
} from '../../../features/ProjectManager/Employee-assign/types/types';

const API_BASE = '/project-manager';

// Employee API calls
export const employeeApi = {
  // Get all available employees with filters
  getAvailableEmployees: async (filter?: EmployeeFilter): Promise<Employee[]> => {
    const params = new URLSearchParams();
    
    if (filter?.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter?.department) params.append('department', filter.department);
    if (filter?.availableOnly !== undefined) params.append('availableOnly', filter.availableOnly.toString());
    if (filter?.minAvailableWorkload) params.append('minAvailableWorkload', filter.minAvailableWorkload.toString());
    if (filter?.skills) {
      filter.skills.forEach(skill => params.append('skills', skill));
    }

    const response = await apiClient.get(`${API_BASE}/employees?${params.toString()}`);
    return response.data;
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`${API_BASE}/employees/${id}`);
    return response.data;
  },

  // Get employee workload details
  getEmployeeWorkload: async (id: string): Promise<EmployeeWorkload> => {
    const response = await apiClient.get(`${API_BASE}/employees/${id}/workload`);
    return response.data;
  },

  // Get employees by skills
  getEmployeesBySkills: async (skills: string[]): Promise<Employee[]> => {
    const params = new URLSearchParams();
    skills.forEach(skill => params.append('skills', skill));
    
    const response = await apiClient.get(`${API_BASE}/employees/by-skills?${params.toString()}`);
    return response.data;
  }
};

// Project API calls
export const projectApi = {
  // Get all projects (reusing existing API)
  getAllProjects: async (status?: string): Promise<Project[]> => {
    const url = status ? `${API_BASE}/projects?status=${status}` : `${API_BASE}/projects`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get project by ID (reusing existing API)
  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`${API_BASE}/projects/${id}`);
    return response.data;
  },

  // Get project assignments
  getProjectAssignments: async (projectId: string): Promise<EmployeeAssignment[]> => {
    const response = await apiClient.get(`${API_BASE}/projects/${projectId}/assignments`);
    return response.data;
  }
};

// Assignment API calls
export const assignmentApi = {
  // Assign single employee to project
  assignEmployeeToProject: async (request: CreateEmployeeAssignmentRequest): Promise<EmployeeAssignment> => {
    const response = await apiClient.post(`${API_BASE}/employee-assignments`, request);
    return response.data;
  },

  // Bulk assign employees to project
  bulkAssignEmployeesToProject: async (request: BulkAssignEmployeesRequest): Promise<EmployeeAssignment[]> => {
    const response = await apiClient.post(`${API_BASE}/employee-assignments/bulk`, request);
    return response.data;
  },

  // Update employee assignment
  updateEmployeeAssignment: async (assignmentId: number, request: UpdateEmployeeAssignmentRequest): Promise<EmployeeAssignment> => {
    const response = await apiClient.put(`${API_BASE}/employee-assignments/${assignmentId}`, request);
    return response.data;
  },

  // Remove employee assignment
  removeEmployeeAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/employee-assignments/${assignmentId}`);
  },

  // Remove employee from project by IDs
  removeEmployeeFromProject: async (projectId: string, employeeId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/projects/${projectId}/employees/${employeeId}`);
  },

  // Get employee assignments
  getEmployeeAssignments: async (employeeId: string): Promise<EmployeeAssignment[]> => {
    const response = await apiClient.get(`${API_BASE}/employees/${employeeId}/assignments`);
    return response.data;
  },

  // Validate assignment
  validateAssignment: async (request: CreateEmployeeAssignmentRequest): Promise<{ isValid: boolean }> => {
    const response = await apiClient.post(`${API_BASE}/validate-assignment`, request);
    return response.data;
  }
};

// Technology/Role API calls (reusing existing APIs)
export const resourceApi = {
  // Get all roles
  getAllRoles: async () => {
    const response = await apiClient.get(`${API_BASE}/roles`);
    return response.data;
  },

  // Get all technologies
  getAllTechnologies: async () => {
    const response = await apiClient.get(`${API_BASE}/technologies`);
    return response.data;
  }
};