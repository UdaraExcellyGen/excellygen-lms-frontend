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

// Cache interface for type safety
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: any;
}

// In-memory cache with TTL (Time To Live)
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.expiresAt - Date.now()
      }))
    };
  }
}

// Request deduplication to prevent concurrent identical requests
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      console.log(`Deduplicating request: ${key}`);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingRequests.clear();
  }
}

// Global cache and deduplicator instances
const cache = new ApiCache();
const deduplicator = new RequestDeduplicator();

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Helper function to create cache keys
const createCacheKey = (base: string, params?: Record<string, any>): string => {
  if (!params) return base;
  
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = Array.isArray(params[key]) 
          ? params[key].sort().join(',') 
          : String(params[key]);
      }
      return acc;
    }, {} as Record<string, string>);

  const paramString = new URLSearchParams(sortedParams).toString();
  return `${base}${paramString ? `?${paramString}` : ''}`;
};

// Employee API calls
export const employeeApi = {
  // Get available employees with pagination and caching
  getAvailableEmployees: async (
    filter?: EmployeeFilter,
    page: number = 1,
    pageSize: number = 50,
    useCache: boolean = true
  ): Promise<PaginatedResponse<Employee>> => {
    const params = new URLSearchParams();
    
    if (filter?.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter?.department) params.append('department', filter.department);
    if (filter?.availableOnly !== undefined) params.append('availableOnly', filter.availableOnly.toString());
    if (filter?.minAvailableWorkload) params.append('minAvailableWorkload', filter.minAvailableWorkload.toString());
    if (filter?.skills) {
      filter.skills.forEach(skill => params.append('skills', skill));
    }
    
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const cacheKey = createCacheKey('employees_paginated', Object.fromEntries(params));
    
    // Try cache first if enabled
    if (useCache) {
      const cached = cache.get<PaginatedResponse<Employee>>(cacheKey);
      if (cached) {
        console.log('Returning cached employees data');
        return cached;
      }
    }

    // Use request deduplication to prevent concurrent identical requests
    return deduplicator.deduplicate(cacheKey, async () => {
      console.log(`Fetching employees: page ${page}, size ${pageSize}`);
      
      const response = await apiClient.get(`${API_BASE}/employees?${params.toString()}`);
      const result = response.data as PaginatedResponse<Employee>;
      
      // Cache the result if caching is enabled
      if (useCache) {
        cache.set(cacheKey, result);
      }
      
      console.log(`Fetched ${result.data.length} of ${result.pagination.totalCount} employees`);
      return result;
    });
  },

  // Get all employees without pagination (for backward compatibility)
  getAllEmployees: async (filter?: EmployeeFilter, useCache: boolean = true): Promise<Employee[]> => {
    const params = new URLSearchParams();
    
    if (filter?.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter?.department) params.append('department', filter.department);
    if (filter?.availableOnly !== undefined) params.append('availableOnly', filter.availableOnly.toString());
    if (filter?.minAvailableWorkload) params.append('minAvailableWorkload', filter.minAvailableWorkload.toString());
    if (filter?.skills) {
      filter.skills.forEach(skill => params.append('skills', skill));
    }

    const cacheKey = createCacheKey('employees_all', Object.fromEntries(params));
    
    if (useCache) {
      const cached = cache.get<Employee[]>(cacheKey);
      if (cached) {
        console.log('Returning cached all employees data');
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/employees/all?${params.toString()}`);
      const result = response.data as Employee[];
      
      if (useCache) {
        cache.set(cacheKey, result);
      }
      
      return result;
    });
  },

  // Get employee by ID with caching
  getEmployeeById: async (id: string, useCache: boolean = true): Promise<Employee> => {
    const cacheKey = `employee_${id}`;
    
    if (useCache) {
      const cached = cache.get<Employee>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/employees/${id}`);
      const result = response.data as Employee;
      
      if (useCache) {
        cache.set(cacheKey, result, 60000); // Cache individual employees for 1 minute
      }
      
      return result;
    });
  },

  // Get employee workload details with caching
  getEmployeeWorkload: async (id: string, useCache: boolean = true): Promise<EmployeeWorkload> => {
    const cacheKey = `employee_workload_${id}`;
    
    if (useCache) {
      const cached = cache.get<EmployeeWorkload>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/employees/${id}/workload`);
      const result = response.data as EmployeeWorkload;
      
      if (useCache) {
        cache.set(cacheKey, result, 30000); // Cache workload for 30 seconds
      }
      
      return result;
    });
  },

  // Get employees by skills with pagination
  getEmployeesBySkills: async (
    skills: string[],
    page: number = 1,
    pageSize: number = 50,
    useCache: boolean = true
  ): Promise<PaginatedResponse<Employee>> => {
    const params = new URLSearchParams();
    skills.forEach(skill => params.append('skills', skill));
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    
    const cacheKey = createCacheKey('employees_by_skills', Object.fromEntries(params));
    
    if (useCache) {
      const cached = cache.get<PaginatedResponse<Employee>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/employees/by-skills?${params.toString()}`);
      const result = response.data as PaginatedResponse<Employee>;
      
      if (useCache) {
        cache.set(cacheKey, result);
      }
      
      return result;
    });
  },

  // Clear cache for specific employee (useful after updates)
  clearEmployeeCache: (employeeId: string): void => {
    cache.delete(`employee_${employeeId}`);
    cache.delete(`employee_workload_${employeeId}`);
    
    // Clear related bulk caches
    const keysToDelete: string[] = [];
    const stats = cache.getStats();
    
    stats.entries.forEach(entry => {
      if (entry.key.includes('employees_') || entry.key.includes('_paginated')) {
        keysToDelete.push(entry.key);
      }
    });
    
    keysToDelete.forEach(key => cache.delete(key));
    
    console.log(`Cleared cache for employee ${employeeId} and related bulk caches`);
  },

  // Clear all employee-related cache
  clearAllCache: (): void => {
    cache.clear();
    deduplicator.clear();
    console.log('Cleared all employee assignment cache');
  }
};

// Project API calls
export const projectApi = {
  // Get all projects (reusing existing API) with caching
  getAllProjects: async (status?: string, useCache: boolean = true): Promise<Project[]> => {
    const cacheKey = status ? `projects_${status}` : 'projects_all';
    
    if (useCache) {
      const cached = cache.get<Project[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const url = status ? `${API_BASE}/projects?status=${status}` : `${API_BASE}/projects`;
      const response = await apiClient.get(url);
      const result = response.data as Project[];
      
      if (useCache) {
        cache.set(cacheKey, result, 60000); // Cache projects for 1 minute
      }
      
      return result;
    });
  },

  // Get project by ID (reusing existing API) with caching
  getProjectById: async (id: string, useCache: boolean = true): Promise<Project> => {
    const cacheKey = `project_${id}`;
    
    if (useCache) {
      const cached = cache.get<Project>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/projects/${id}`);
      const result = response.data as Project;
      
      if (useCache) {
        cache.set(cacheKey, result, 60000);
      }
      
      return result;
    });
  },

  // Get project assignments with caching
  getProjectAssignments: async (projectId: string, useCache: boolean = true): Promise<EmployeeAssignment[]> => {
    const cacheKey = `project_assignments_${projectId}`;
    
    if (useCache) {
      const cached = cache.get<EmployeeAssignment[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/projects/${projectId}/assignments`);
      const result = response.data as EmployeeAssignment[];
      
      if (useCache) {
        cache.set(cacheKey, result, 30000); // Cache assignments for 30 seconds
      }
      
      return result;
    });
  },

  // Clear cache for specific project
  clearProjectCache: (projectId: string): void => {
    cache.delete(`project_${projectId}`);
    cache.delete(`project_assignments_${projectId}`);
    console.log(`Cleared cache for project ${projectId}`);
  }
};

// Assignment API calls
export const assignmentApi = {
  // Assign single employee to project
  assignEmployeeToProject: async (request: CreateEmployeeAssignmentRequest): Promise<EmployeeAssignment> => {
    const response = await apiClient.post(`${API_BASE}/employee-assignments`, request);
    
    // Clear relevant caches after assignment
    employeeApi.clearEmployeeCache(request.EmployeeId);
    projectApi.clearProjectCache(request.ProjectId);
    
    return response.data;
  },

  // Bulk assign employees to project
  bulkAssignEmployeesToProject: async (request: BulkAssignEmployeesRequest): Promise<EmployeeAssignment[]> => {
    const response = await apiClient.post(`${API_BASE}/employee-assignments/bulk`, request);
    
    // Clear caches for all affected employees and the project
    request.assignments.forEach(assignment => {
      employeeApi.clearEmployeeCache(assignment.employeeId);
    });
    projectApi.clearProjectCache(request.projectId);
    
    return response.data;
  },

  // Update employee assignment
  updateEmployeeAssignment: async (assignmentId: number, request: UpdateEmployeeAssignmentRequest): Promise<EmployeeAssignment> => {
    const response = await apiClient.put(`${API_BASE}/employee-assignments/${assignmentId}`, request);
    
    // Clear all employee and project caches since we don't know which employee/project this affects
    employeeApi.clearAllCache();
    
    return response.data;
  },

  // Remove employee assignment
  removeEmployeeAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/employee-assignments/${assignmentId}`);
    
    // Clear all caches since we don't know which employee/project this affects
    employeeApi.clearAllCache();
  },

  // ✅ NEW: Remove specific assignment (alias for removeEmployeeAssignment for better naming)
  removeSpecificAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`${API_BASE}/employee-assignments/${assignmentId}`);
    
    // Clear all caches since we don't know which employee/project this affects
    employeeApi.clearAllCache();
  },

  // Remove employee from project by IDs
  removeEmployeeFromProject: async (projectId: string, employeeId: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/projects/${projectId}/employees/${employeeId}`);
    
    // Clear specific caches
    employeeApi.clearEmployeeCache(employeeId);
    projectApi.clearProjectCache(projectId);
  },

  // Get employee assignments
  getEmployeeAssignments: async (employeeId: string, useCache: boolean = true): Promise<EmployeeAssignment[]> => {
    const cacheKey = `employee_assignments_${employeeId}`;
    
    if (useCache) {
      const cached = cache.get<EmployeeAssignment[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/employees/${employeeId}/assignments`);
      const result = response.data as EmployeeAssignment[];
      
      if (useCache) {
        cache.set(cacheKey, result, 30000);
      }
      
      return result;
    });
  },

  // Validate assignment
  validateAssignment: async (request: CreateEmployeeAssignmentRequest): Promise<{ isValid: boolean }> => {
    const response = await apiClient.post(`${API_BASE}/validate-assignment`, request);
    return response.data;
  }
};

// Technology/Role API calls (reusing existing APIs)
export const resourceApi = {
  // Get all roles with caching
  getAllRoles: async (useCache: boolean = true) => {
    const cacheKey = 'roles_all';
    
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/roles`);
      const result = response.data;
      
      if (useCache) {
        cache.set(cacheKey, result, 300000); // Cache roles for 5 minutes
      }
      
      return result;
    });
  },

  // Get all technologies with caching
  getAllTechnologies: async (useCache: boolean = true) => {
    const cacheKey = 'technologies_all';
    
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return deduplicator.deduplicate(cacheKey, async () => {
      const response = await apiClient.get(`${API_BASE}/technologies`);
      const result = response.data;
      
      if (useCache) {
        cache.set(cacheKey, result, 300000); // Cache technologies for 5 minutes
      }
      
      return result;
    });
  }
};

// Export cache utilities for debugging and manual cache management
export const cacheUtils = {
  getStats: () => cache.getStats(),
  clearAll: () => {
    cache.clear();
    deduplicator.clear();
  },
  clearExpired: () => cache.cleanup()
};

// Export the enhanced types for use in components
export type { PaginatedResponse };