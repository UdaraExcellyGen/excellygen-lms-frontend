// ProjectCruds/data/types.ts
export interface Project {
    id: number;
    name: string;
    status: string;
    deadline: string | null;
    startDate: string | null;
    description: string;
    shortDescription: string;
    progress: number;
    requiredSkills: { id: number; name: string }[];
    requiredRoles: { roleId: number; roleName?: string; count: number }[];
    assignedRoles?: { roleId: number; roleName: string; amount: number }[];
}

export interface EmployeeTechnology {
    id: number;
    name: string;
}

export interface ProjectRole {
    id: number;
    name: string;
}

export interface RoleAssignment {
    roleId: number;
    roleName: string;
    amount: number;
}