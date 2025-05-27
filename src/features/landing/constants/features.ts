import { 
  BookOpen, 
  Users, 
  BarChart,
  Layout,
  Globe,
  Target
} from 'lucide-react';
import { Feature } from '../types';

export const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description: "Engage with interactive content, quizzes, and assessments."
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Comprehensive tools for tracking employee skills, projects, and development paths."
  },
  {
    icon: BarChart,
    title: "Performance Tracking",
    description: "Monitor employee progress, bench status, and project assignments in real-time."
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Connect with peers and experts through discussion forums."
  },
  {
    icon: Layout,
    title: "Learning Paths",
    description: "Customized learning paths based on job roles and departments."
  },
  {
    icon: Globe,
    title: "Multi-Platform Integration",
    description: "Seamless integration with LinkedIn Learning, Coursera, and Udemy."
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Personalized recommendations based on industry benchmarks."
  },
  {
    icon: BarChart,
    title: "Advanced Analytics",
    description: "Detailed reports and predictive learning trends."
  }
];