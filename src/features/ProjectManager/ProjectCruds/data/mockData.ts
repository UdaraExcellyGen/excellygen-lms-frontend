// ProjectCruds/data/mockData.ts
import { Project, EmployeeTechnology, ProjectRole } from './types';

export const projectsData: Project[] = [
    {
        id: 1,
        name: "Website Redesign",
        status: "Active",
        deadline: "2025-06-30",
        startDate: "2025-01-15",
        description: "Complete overhaul of the company website to improve user experience and modernize the design.",
        shortDescription: "Website redesign with new UI/UX",
        progress: 25,
        requiredSkills: [
            { id: 1, name: ".NET" },
            { id: 2, name: "SQL" }
        ],
        requiredRoles: [
            { roleId: 1, roleName: "Scrum Master", count: 1 },
            { roleId: 2, roleName: "Frontend Developer", count: 2 }
        ]
    },
    {
        id: 2,
        name: "Mobile App Development",
        status: "Active",
        deadline: "2025-09-15",
        startDate: "2025-03-01",
        description: "Development of a new mobile application for both iOS and Android platforms to support customer engagement.",
        shortDescription: "New mobile app for iOS and Android",
        progress: 15,
        requiredSkills: [
            { id: 3, name: "React" },
            { id: 4, name: "Python" }
        ],
        requiredRoles: [
            { roleId: 3, roleName: "Product Owner", count: 1 },
            { roleId: 4, roleName: "Backend Developer", count: 3 }
        ]
    },
    {
        id: 3,
        name: "Database Optimization",
        status: "Completed",
        deadline: "2024-12-31",
        startDate: "2024-10-01",
        description: "Comprehensive analysis and optimization of database structures to improve performance and scalability.",
        shortDescription: "Database performance enhancement",
        progress: 100,
        requiredSkills: [
            { id: 2, name: "SQL" },
            { id: 5, name: "Vue.js" }
        ],
        requiredRoles: [
            { roleId: 5, roleName: "Team Lead/Development Lead", count: 1 },
            { roleId: 6, roleName: "Database Administrator", count: 2 }
        ]
    }
];

export const employeeTechnologiesData: EmployeeTechnology[] = [
    { id: 1, name: ".NET" },
    { id: 2, name: "SQL" },
    { id: 3, name: "React" },
    { id: 4, name: "Python" },
    { id: 5, name: "Vue.js" }
];

export const projectRolesData: ProjectRole[] = [
    { id: 1, name: "Scrum Master" },
    { id: 2, name: "Frontend Developer" },
    { id: 3, name: "Product Owner" },
    { id: 4, name: "Backend Developer" },
    { id: 5, name: "Team Lead/Development Lead" },
    { id: 6, name: "Database Administrator" },
    { id: 7, name: "Business Analyst" },
    { id: 8, name: "Developer" }
];