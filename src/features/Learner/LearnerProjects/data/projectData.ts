import { Project } from '../types/Project';

export const projects: Project[] = [
  {
    id: 1,
    title: "E-commerce Platform Development",
    status: "Assigned",
    description: "Develop a full-stack e-commerce platform with React and Node.js",
    team: ["John Doe", "Jane Smith", "You"],
    role: "Frontend Developer",
    startDate: "Feb 15, 2024",
    endDate: "Mar 30, 2024",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"]
  },
  {
    id: 2,
    title: "Learning Management System",
    status: "Completed",
    description: "Built a comprehensive LMS with course management",
    team: ["You", "Alice Johnson"],
    role: "Full Stack Developer",
    startDate: "Jan 1, 2024",
    completionDate: "Feb 10, 2024",
    technologies: ["React", "TypeScript", "Firebase"]
  },
  {
    id: 3,
    title: "Mobile App for Task Management",
    status: "Assigned",
    description: "Creating a mobile application for task and project management",
    team: ["You", "Bob Wilson", "Carol Brown"],
    role: "Mobile Developer",
    startDate: "Feb 20, 2024",
    endDate: "Apr 15, 2024",
    technologies: ["React Native", "Redux", "AWS"]
  },
  {
    id: 4,
    title: "AI-Powered Data Analytics Dashboard",
    status: "Assigned",
    description: "Developing a dashboard for visualizing and analyzing data",
    team: ["You", "David Miller", "Emma Wilson"],
    role: "Data Visualization Engineer",
    startDate: "Mar 1, 2024",
    endDate: "May 15, 2024",
    technologies: ["Python", "TensorFlow", "D3.js", "React"]
  },
  {
    id: 5,
    title: "CRM Integration System",
    status: "Completed",
    description: "Developed a system to integrate multiple CRM platforms",
    team: ["You", "Frank Thomas"],
    role: "Backend Developer",
    startDate: "Dec 10, 2023",
    completionDate: "Jan 25, 2024",
    technologies: ["Java", "Spring Boot", "REST APIs"]
  }
];