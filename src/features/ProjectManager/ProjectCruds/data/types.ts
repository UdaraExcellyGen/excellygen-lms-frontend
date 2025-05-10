// Path: src/features/ProjectManager/ProjectCruds/data/types.ts

export interface Project {
    id: number | string;
    name: string;
    status: string;
    deadline: string | null;
    startDate: string | null;
    description: string;
    shortDescription: string;
    progress: number;
    requiredSkills: { id: number | string; name: string }[];
    requiredRoles: { roleId: number | string; roleName?: string; count: number }[];
    creatorId?: string;
    creatorName?: string;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface EmployeeTechnology {
    id: number | string;
    name: string;
}

export interface ProjectRole {
    id: number | string;
    name: string;
}

export interface RoleAssignment {
    roleId: number | string;
    roleName: string;
    amount: number;
}

export interface CreateProjectRequest {
    name: string;
    status: string;
    deadline: string | null;
    startDate: string | null;
    description: string;
    shortDescription: string;
    progress: number;
    requiredTechnologyIds: string[];
    requiredRoles: { roleId: string; count: number }[];
}

export interface UpdateProjectRequest {
    name: string;
    status: string;
    deadline: string | null;
    startDate: string | null;
    description: string;
    shortDescription: string;
    progress: number;
    requiredTechnologyIds: string[];
    requiredRoles: { roleId: string; count: number }[];
}

export interface Role {
    id: number | string;
    name: string;
}

export interface CreateRoleRequest {
    name: string;
}

export interface UpdateRoleRequest {
    name: string;
}