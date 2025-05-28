// Path: src/features/ProjectManager/Employee-assign/types/types.ts

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  currentWorkloadPercentage: number;
  availableWorkloadPercentage: number;
  skills: string[];
  activeProjects: string[];
  currentAssignments: EmployeeAssignment[];
}

export interface EmployeeAssignment {
  id: number;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  role: string;
  workloadPercentage: number;
  assignedDate: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  deadline: string;
  description: string;
  shortDescription: string;
  requiredSkills: TechnologySkill[];
  requiredRoles: RequiredRole[];
  employeeAssignments: EmployeeAssignment[];
}

export interface TechnologySkill {
  id: string;
  name: string;
}

export interface RequiredRole {
  roleId: string;
  roleName: string;
  count: number;
}

export interface CreateEmployeeAssignmentRequest {
  projectId: string;
  employeeId: string;
  role: string;
  workloadPercentage: number;
}

export interface UpdateEmployeeAssignmentRequest {
  role: string;
  workloadPercentage: number;
}

export interface BulkAssignEmployeesRequest {
  projectId: string;
  assignments: EmployeeAssignmentRequest[];
}

export interface EmployeeAssignmentRequest {
  employeeId: string;
  role: string;
  workloadPercentage: number;
}

export interface EmployeeFilter {
  searchTerm?: string;
  department?: string;
  availableOnly?: boolean;
  minAvailableWorkload?: number;
  skills?: string[];
}

export interface EmployeeWorkload {
  employeeId: string;
  employeeName: string;
  totalWorkloadPercentage: number;
  availableWorkloadPercentage: number;
  projectWorkloads: ProjectWorkload[];
}

export interface ProjectWorkload {
  projectId: string;
  projectName: string;
  workloadPercentage: number;
  role: string;
}