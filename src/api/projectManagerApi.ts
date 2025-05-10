// Path: src/api/projectManagerApi.ts

import apiClient from './apiClient';
import axios from 'axios';
import { handleApiError } from '../utils/apiConfig';
import { 
    Project, 
    CreateProjectRequest, 
    UpdateProjectRequest, 
    Role, 
    CreateRoleRequest,
    UpdateRoleRequest,
    EmployeeTechnology
} from '../features/ProjectManager/ProjectCruds/data/types';

// Project CRUD operations
export const getAllProjects = async (status?: string): Promise<Project[]> => {
    try {
        const url = status ? `/project-manager/projects?status=${status}` : '/project-manager/projects';
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw handleApiError(error);
    }
};

export const getProjectById = async (id: string): Promise<Project> => {
    try {
        const response = await apiClient.get(`/project-manager/projects/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw handleApiError(error);
    }
};

export const createProject = async (project: CreateProjectRequest): Promise<Project> => {
    try {
        // Log the data being sent
        console.log("Sending project data:", JSON.stringify(project));
        
        // Ensure all required fields are present and not null
        const sanitizedProject = {
            ...project,
            description: project.description || "",
            shortDescription: project.shortDescription || "",
            status: project.status || "Active",
            progress: typeof project.progress === 'number' ? project.progress : 0,
            requiredTechnologyIds: project.requiredTechnologyIds || [],
            requiredRoles: project.requiredRoles || []
        };
        
        const response = await apiClient.post('/project-manager/projects', sanitizedProject);
        console.log("Project created successfully:", response.data);
        return response.data;    } catch (error: unknown) {
        console.error('Error creating project:', error);
        
        // Detailed error logging with proper type checking
        if (axios.isAxiosError(error)) {
            // Now TypeScript knows this is an AxiosError
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            } else if (error.request) {
                console.error('No response received from server');
            }
        } else if (error instanceof Error) {
            // For non-Axios errors that are still Error objects
            console.error('Request setup error:', error.message);
        }
        
        throw handleApiError(error);
    }
};
export const updateProject = async (id: string, project: UpdateProjectRequest): Promise<Project> => {
    try {
        const response = await apiClient.put(`/project-manager/projects/${id}`, project);
        return response.data;
    } catch (error) {
        console.error(`Error updating project ${id}:`, error);
        throw handleApiError(error);
    }
};

export const deleteProject = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/project-manager/projects/${id}`);
    } catch (error) {
        console.error(`Error deleting project ${id}:`, error);
        throw handleApiError(error);
    }
};

// Role CRUD operations
export const getAllRoles = async (): Promise<Role[]> => {
    try {
        const response = await apiClient.get('/project-manager/roles');
        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw handleApiError(error);
    }
};

export const createRole = async (role: CreateRoleRequest): Promise<Role> => {
    try {
        const response = await apiClient.post('/project-manager/roles', role);
        return response.data;
    } catch (error) {
        console.error('Error creating role:', error);
        throw handleApiError(error);
    }
};

export const updateRole = async (id: string, role: UpdateRoleRequest): Promise<Role> => {
    try {
        const response = await apiClient.put(`/project-manager/roles/${id}`, role);
        return response.data;
    } catch (error) {
        console.error(`Error updating role ${id}:`, error);
        throw handleApiError(error);
    }
};

export const deleteRole = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/project-manager/roles/${id}`);
    } catch (error) {
        console.error(`Error deleting role ${id}:`, error);
        throw handleApiError(error);
    }
};

// Technology operations
export const getProjectTechnologies = async (): Promise<EmployeeTechnology[]> => {
    try {
        const response = await apiClient.get('/project-manager/technologies');
        return response.data;
    } catch (error) {
        console.error('Error fetching technologies:', error);
        throw handleApiError(error);
    }
};

// Technology CRUD operations using Admin API
export interface CreateTechnologyDto {
    name: string;
}

export interface UpdateTechnologyDto {
    name: string;
}

export const createTechnology = async (createTechnologyDto: CreateTechnologyDto): Promise<EmployeeTechnology> => {
    try {
        // This calls the Admin Technologies endpoint
        const response = await apiClient.post('/Technologies', createTechnologyDto);
        return response.data;
    } catch (error) {
        console.error('Error creating technology:', error);
        throw handleApiError(error);
    }
};

export const updateTechnology = async (id: string, updateTechnologyDto: UpdateTechnologyDto): Promise<EmployeeTechnology> => {
    try {
        const response = await apiClient.put(`/Technologies/${id}`, updateTechnologyDto);
        return response.data;
    } catch (error) {
        console.error(`Error updating technology ${id}:`, error);
        throw handleApiError(error);
    }
};

export const deleteTechnology = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/Technologies/${id}`);
    } catch (error) {
        console.error(`Error deleting technology ${id}:`, error);
        throw handleApiError(error);
    }
};