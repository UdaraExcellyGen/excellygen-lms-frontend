import { UserData } from '../types/types';

export const sampleUserData: UserData = {
  personalInfo: {
    name: "Alex Johnson",
    position: "Full Stack Developer",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    department: "Software Engineering",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    summary: "Passionate full-stack developer with expertise in React, Node.js, and AI integration. Committed to creating innovative solutions that drive business growth and digital transformation."
  },
  projects: [
    {
      title: "E-Commerce AI Platform",
      description: "Developed an AI-powered recommendation engine that increased sales by 35%",
      technologies: ["React", "Node.js", "Python", "TensorFlow"],
      startDate: "2023-08-15",
      completionDate: "2024-02-15",
      status: "Completed"
    },
    {
      title: "LMS Dashboard System",
      description: "Built a comprehensive learning management system with real-time analytics",
      technologies: ["React", "TypeScript", "MongoDB", "Express"],
      startDate: "2024-01-10",
      completionDate: null,
      status: "In Progress"
    },
    {
      title: "Data Visualization Tool",
      description: "Created interactive dashboards for business intelligence insights",
      technologies: ["D3.js", "React", "PostgreSQL", "AWS"],
      startDate: "2023-11-01",
      completionDate: "2024-01-31",
      status: "Completed"
    }
  ],
  courses: [
    {
      title: "Advanced React Development",
      provider: "Excelly Gen Academy",
      completionDate: "2024-03-15",
      duration: "8 weeks",
      certificate: true
    },
    {
      title: "AI & Machine Learning Fundamentals",
      provider: "Excelly Gen Academy",
      completionDate: "2024-02-20",
      duration: "12 weeks",
      certificate: true
    },
    {
      title: "Cloud Architecture with AWS",
      provider: "Excelly Gen Academy",
      completionDate: "2024-01-10",
      duration: "6 weeks",
      certificate: true
    },
    {
      title: "Data Science with Python",
      provider: "Excelly Gen Academy",
      completionDate: "2023-12-05",
      duration: "10 weeks",
      certificate: true
    }
  ],
  skills: [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", 
    "AI/ML", "AWS", "Docker", "MongoDB", "PostgreSQL"
  ]
};