import { ProfileData } from '../types';

// Create a collection of mock learner profiles for search results
export const mockLearners: ProfileData[] = [
  {
    id: "LRN001",
    name: "Alex Johnson",
    role: "Frontend Developer",
    email: "alex@excellygen.com",
    phone: "+94 771234001",
    location: "Colombo, LK",
    department: "Engineering",
    bio: "Frontend developer with expertise in React and modern JavaScript frameworks.",
    skills: [
      { name: "React" },
      { name: "TypeScript" },
      { name: "CSS" },
      { name: "Node.js" }
    ],
    certifications: [
      { name: "React Advanced Patterns", issueDate: "Jan 2024", status: "Completed" },
      { name: "TypeScript Mastery", issueDate: "Dec 2023", status: "Completed" }
    ],
    projects: [
      {
        name: "Dashboard Redesign",
        description: "Redesigned the company's dashboard for better UX",
        status: "Completed",
        startDate: "2023-09-01",
        endDate: "2024-01-05",
        role: "Frontend Developer",
        technologies: ["React", "TypeScript", "Tailwind CSS"]
      }
    ],
    rewards: {
      totalBadges: 8,
      thisMonth: 1,
      level: "Intermediate",
      recentBadges: []
    }
  },
  {
    id: "LRN002",
    name: "Samantha Silva",
    role: "Backend Developer",
    email: "samantha@excellygen.com",
    phone: "+94 771234002",
    location: "Kandy, LK",
    department: "Engineering",
    bio: "Backend developer focused on scalable architecture and API design.",
    skills: [
      { name: "Java" },
      { name: "Spring Boot" },
      { name: "Docker" },
      { name: "AWS" }
    ],
    certifications: [
      { name: "Spring Boot Microservices", issueDate: "Feb 2024", status: "Completed" },
      { name: "AWS Solutions Architect", issueDate: "Nov 2023", status: "Completed" }
    ],
    projects: [
      {
        name: "API Gateway Implementation",
        description: "Implemented a new API gateway for microservices architecture",
        status: "Completed",
        startDate: "2023-10-15",
        endDate: "2024-02-20",
        role: "Backend Lead",
        technologies: ["Spring Boot", "AWS", "Docker"]
      }
    ],
    rewards: {
      totalBadges: 12,
      thisMonth: 2,
      level: "Advanced",
      recentBadges: []
    }
  },
  {
    id: "LRN003",
    name: "Raj Kumar",
    role: "Full Stack Developer",
    email: "raj@excellygen.com",
    phone: "+94 771234003",
    location: "Galle, LK",
    department: "Engineering",
    bio: "Full stack developer with a passion for user experience and clean code.",
    skills: [
      { name: "React" },
      { name: ".NET" },
      { name: "Azure" },
      { name: "SQL" }
    ],
    certifications: [
      { name: "Full Stack Development", issueDate: "Jan 2024", status: "Completed" },
      { name: "Azure Developer Associate", issueDate: "Dec 2023", status: "Completed" }
    ],
    projects: [
      {
        name: "Customer Portal Development",
        description: "Built a new customer portal with modern tech stack",
        status: "Completed",
        startDate: "2023-08-01",
        endDate: "2024-01-30",
        role: "Full Stack Developer",
        technologies: ["React", ".NET", "Azure", "SQL Server"]
      }
    ],
    rewards: {
      totalBadges: 9,
      thisMonth: 1,
      level: "Intermediate",
      recentBadges: []
    }
  },
  {
    id: "LRN004",
    name: "Aisha Perera",
    role: "DevOps Engineer",
    email: "aisha@excellygen.com",
    phone: "+94 771234004",
    location: "Negombo, LK",
    department: "Engineering",
    bio: "DevOps engineer specializing in CI/CD pipeline optimization and infrastructure as code.",
    skills: [
      { name: "Docker" },
      { name: "Kubernetes" },
      { name: "AWS" },
      { name: "Terraform" }
    ],
    certifications: [
      { name: "Kubernetes Administration", issueDate: "Mar 2024", status: "Completed" },
      { name: "Terraform Associate", issueDate: "Jan 2024", status: "Completed" }
    ],
    projects: [
      {
        name: "CI/CD Pipeline Optimization",
        description: "Reduced build times by 60% through pipeline optimization",
        status: "Completed",
        startDate: "2023-11-01",
        endDate: "2024-02-15",
        role: "DevOps Lead",
        technologies: ["Docker", "Kubernetes", "GitHub Actions", "AWS"]
      }
    ],
    rewards: {
      totalBadges: 7,
      thisMonth: 2,
      level: "Advanced",
      recentBadges: []
    }
  },
  {
    id: "LRN005",
    name: "Michael Fernando",
    role: "QA Engineer",
    email: "michael@excellygen.com",
    phone: "+94 771234005",
    location: "Colombo, LK",
    department: "Quality Assurance",
    bio: "Quality Assurance engineer focused on test automation and quality processes.",
    skills: [
      { name: "Selenium" },
      { name: "Cypress" },
      { name: "JavaScript" },
      { name: "Python" }
    ],
    certifications: [
      { name: "Test Automation with Cypress", issueDate: "Feb 2024", status: "Completed" },
      { name: "ISTQB Advanced Level", issueDate: "Dec 2023", status: "Completed" }
    ],
    projects: [
      {
        name: "Automated Test Framework",
        description: "Built a comprehensive test automation framework for web applications",
        status: "Completed",
        startDate: "2023-09-15",
        endDate: "2024-01-20",
        role: "Senior QA Engineer",
        technologies: ["Cypress", "JavaScript", "Jenkins", "Docker"]
      }
    ],
    rewards: {
      totalBadges: 6,
      thisMonth: 1,
      level: "Intermediate",
      recentBadges: []
    }
  }
];

// Function to search learners by ID or name
export const searchLearners = (query: string): ProfileData[] => {
  if (!query || query.trim() === '') return [];
  
  const lowerCaseQuery = query.toLowerCase().trim();
  
  return mockLearners.filter(learner => 
    learner.id?.toLowerCase().includes(lowerCaseQuery) ||
    learner.name.toLowerCase().includes(lowerCaseQuery)
  );
};