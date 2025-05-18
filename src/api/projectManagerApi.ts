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
    EmployeeTechnology,
    CreateTechnologyDto,
    UpdateTechnologyDto
} from '../features/ProjectManager/ProjectCruds/data/types';

// Project CRUD operations remain unchanged
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
        return response.data;    
    } catch (error: unknown) {
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

// Role CRUD operations remain unchanged
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

// Technology operations - UPDATED to remove [PM] prefix
export const getProjectTechnologies = async (): Promise<EmployeeTechnology[]> => {
    try {
        // Use the project manager endpoint to get technologies
        const response = await apiClient.get('/project-manager/technologies');
        console.log('Technology response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching technologies:', error);
        throw handleApiError(error);
    }
};

// UPDATED: No longer adding [PM] prefix
export const createTechnology = async (createTechnologyDto: CreateTechnologyDto): Promise<EmployeeTechnology> => {
    try {
        // No longer adding a prefix to the name
        const techName = createTechnologyDto.name.trim();
        
        // Create a modified DTO with the clean name
        const modifiedDto = {
            ...createTechnologyDto,
            name: techName
        };
        
        // Log what we're doing
        console.log(`Creating technology: ${techName}`);
        
        // Add a custom header to indicate the creator type is project_manager
        // This replaces the visual [PM] prefix with proper metadata
        const headers = {
            'X-Creator-Type': 'project_manager'
        };
        
        // Use standard endpoint with custom header
        const response = await apiClient.post('/Technologies', modifiedDto, { headers });
        
        // Add a small delay to ensure updates are reflected
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return response.data;
    } catch (error) {
        console.error('Error creating technology:', error);
        throw handleApiError(error);
    }
};

export const updateTechnology = async (id: string, updateTechnologyDto: UpdateTechnologyDto): Promise<EmployeeTechnology> => {
    try {
        // Use standard endpoint with headers
        const headers = {
            'X-Creator-Type': 'project_manager'
        };
        
        const response = await apiClient.put(`/Technologies/${id}`, updateTechnologyDto, { headers });
        
        // Add a small delay to ensure updates are reflected
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return response.data;
    } catch (error) {
        console.error(`Error updating technology ${id}:`, error);
        throw handleApiError(error);
    }
};

export const deleteTechnology = async (id: string): Promise<void> => {
    try {
        // Use standard endpoint with headers
        const headers = {
            'X-Creator-Type': 'project_manager'
        };
        
        await apiClient.delete(`/Technologies/${id}`, { headers });
        
        // Add a small delay to ensure updates are reflected
        await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
        console.error(`Error deleting technology ${id}:`, error);
        throw handleApiError(error);
    }
};