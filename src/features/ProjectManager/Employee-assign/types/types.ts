export interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  status: string;
  completedProjects: number;
  activeProjects: string[];
  coursesCompleted: string[];
}

export interface RoleItem {
  role: string;
  count: number;
}

export interface EmployeeAssignment {
  employeeId: number;
  role: string;
  workloadPercentage: number;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  deadline: string;
  description: string;
  shortDescription: string;
  requiredSkills: string[];
  assignedEmployees: EmployeeAssignment[];
  requiredRoles: RoleItem[];
  initialRequiredRoles: RoleItem[];
}

export interface CourseSkillMap {
  [courseName: string]: string[];
}