import { Employee, Project, CourseSkillMap } from '../types/types';

// Sample project data
export const projectsData: Project[] = [
  {
    id: 1,
    name: "Website Redesign",
    status: "Active",
    deadline: "2025-02-27",
    description: "Complete overhaul of the company website to improve user experience and modernize the design.",
    shortDescription: "Initiating phase for Project Alpha. Focus on defining scope and gathering initial requirements.",
    requiredSkills: [".NET", "SQL"],
    assignedEmployees: [],
    requiredRoles: [
      { role: "Scrum Master", count: 1 },
      { role: "Backend Developer", count: 2 },
      { role: "Frontend Developer", count: 3 }
    ],
    initialRequiredRoles: [
      { role: "Scrum Master", count: 1 },
      { role: "Backend Developer", count: 2 },
      { role: "Frontend Developer", count: 3 }
    ]
  },
  {
    id: 2,
    name: "Mobile App Development",
    status: "Active",
    deadline: "2025-06-25",
    description: "Development of a new mobile application for both iOS and Android platforms to support customer engagement.",
    shortDescription: "Active development sprint for Project Beta. Currently focused on core feature implementation.",
    requiredSkills: ["Python", "SQL"],
    assignedEmployees: [],
    requiredRoles: [
      { role: "Product Owner", count: 1 },
      { role: "Backend Developer", count: 4 }
    ],
    initialRequiredRoles: [
      { role: "Product Owner", count: 1 },
      { role: "Backend Developer", count: 4 }
    ]
  },
  {
    id: 3,
    name: "Marketing Campaign Launch",
    status: "Active",
    deadline: "2024-01-17",
    description: "Planning and execution of a comprehensive marketing campaign to promote new product offerings.",
    shortDescription: "Project Gamma is now active after resource allocation.",
    requiredSkills: ["React", "Vue.js"],
    assignedEmployees: [],
    requiredRoles: [
      { role: "Business Analyst", count: 2 }
    ],
    initialRequiredRoles: [
      { role: "Business Analyst", count: 2 }
    ]
  },
  {
    id: 4,
    name: "Database Optimization",
    status: "Active",
    deadline: "2025-06-23",
    description: "Comprehensive analysis and optimization of database structures to improve performance and scalability.",
    shortDescription: "Rigorous testing and QA phase for Project Delta before release.",
    requiredSkills: [".NET", "React"],
    assignedEmployees: [],
    requiredRoles: [
      { role: "Team Lead/Development Lead", count: 1 },
      { role: "Frontend Developer", count: 2 },
      { role: "Backend Developer", count: 2 }
    ],
    initialRequiredRoles: [
      { role: "Team Lead/Development Lead", count: 1 },
      { role: "Frontend Developer", count: 2 },
      { role: "Backend Developer", count: 2 }
    ]
  },
  {
    id: 5,
    name: "Training Program Development",
    status: "Completed",
    deadline: "2026-02-27",
    description: "Design and implementation of a comprehensive training program for new staff onboarding.",
    shortDescription: "Project Epsilon successfully completed and deployed to production.",
    requiredSkills: ["SQL", "Python"],
    assignedEmployees: [],
    requiredRoles: [
      { role: "Database Administrator", count: 1 }
    ],
    initialRequiredRoles: [
      { role: "Database Administrator", count: 1 }
    ]
  }
];

// Sample employee data
export const employeesData: Employee[] = [
  {
    id: 1001,
    name: "Dilkini Imasha",
    role: "Senior Frontend Developer",
    skills: [],
    status: "Available",
    completedProjects: 15,
    activeProjects: ["Project Beta", "Website Redesign"],
    coursesCompleted: ["Advanced React"]
  },
  {
    id: 1002,
    name: "Asitha Udara",
    role: "Backend Developer",
    skills: [],
    status: "On Project",
    completedProjects: 10,
    activeProjects: ["Project Beta", "E-commerce Platform"],
    coursesCompleted: ["Node.js Masterclass", "Database Design"]
  },
  {
    id: 1003,
    name: "Shamini Nirodya",
    role: "Full Stack Developer",
    skills: [],
    status: "Partially Available",
    completedProjects: 8,
    activeProjects: ["Mobile App UI Redesign"],
    coursesCompleted: ["Full Stack Development Bootcamp"]
  },
  {
    id: 1004,
    name: "Mehara Rothila",
    role: "UI/UX Designer",
    skills: [],
    status: "Available",
    completedProjects: 20,
    activeProjects: [],
    coursesCompleted: ["UX Design Principles", "UI Animation"]
  },
  {
    id: 1005,
    name: "Sehani Hewage",
    role: "Data Scientist",
    skills: [],
    status: "Partially Available",
    completedProjects: 5,
    activeProjects: ["Analytics Dashboard"],
    coursesCompleted: ["Data Science (Course)", "Machine Learning (Course)"]
  }
];

// Course to skills mapping
export const courseSkillMap: CourseSkillMap = {
  "Advanced React": ["React", "JavaScript"],
  "TypeScript Fundamentals": ["TypeScript", "JavaScript"],
  "Node.js Masterclass": ["JavaScript"],
  "Database Design": ["SQL"],
  "Full Stack Development Bootcamp": ["React", "JavaScript", "SQL"],
  "UX Design Principles": ["HTML", "CSS"],
  "UI Animation": ["CSS", "JavaScript"],
  "Data Science (Course)": ["Java"],
  "Machine Learning (Course)": ["Java"],
  "Frontend Development (Course)": ["HTML", "CSS", "JavaScript", "React"],
  "Advanced Selenium": ["Java"],
  "Performance Testing": ["Java"],
  "AWS Certified DevOps Engineer": [],
  "Kubernetes Administration": [],
  "PMP Certification": [],
  "Agile Project Management": [],
  "Django REST Framework": [],
  "Python for Backend": [],
  "Certified Security Specialist": [],
  "Database Administration": ["SQL"],
  "UX Research Methods": []
};

// List of technology skills
export const techSkillsList = [".NET", "SQL", "Python", "React", "Vue.js"];

// Project roles
export const projectRoles = [
  "Scrum Master",
  "Product Owner",
  "Business Analyst",
  "Team Lead/Development Lead",
  "Frontend Developer",
  "Backend Developer",
  "Database Administrator",
  "Developer"
];