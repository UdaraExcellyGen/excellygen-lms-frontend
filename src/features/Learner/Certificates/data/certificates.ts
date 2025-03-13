import { Certificate } from '../types/certificate';

export const certificates: Certificate[] = [
    {
        id: 1,
        title: "Web Development Fundamentals",
        issuer: "ExcellyGen Academy",
        status: "Completed",
        completionDate: "Feb 15, 2024",
        grade: "95%",
        skills: ["HTML5", "CSS3", "JavaScript"],
    },
    {
        id: 2,
        title: "Machine Learning Fundamentals",
        issuer: "ExcellyGen Academy",
        status: "In Progress",
        expectedCompletion: "Mar 30, 2024",
        progress: 75,
        skills: ["Python", "TensorFlow", "Data Science"],
    },
    {
        id: 3,
        title: "Cloud Architecture",
        issuer: "ExcellyGen Academy",
        status: "Completed",
        completionDate: "Jan 10, 2024",
        grade: "88%",
        skills: ["AWS", "DevOps", "Infrastructure"],
    }
];