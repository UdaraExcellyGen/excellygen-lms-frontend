import { 
  Book, 
  Users,
  BarChart2, 
  Cpu
} from 'lucide-react';
import { QuickAction } from '../types/types';


export const getQuickActions = (navigate: (path: string) => void): QuickAction[] => [
  {
    text: 'Manage Users',
    icon: Users,
    color: 'bg-[#BF4BF6]',
    onClick: () => navigate('/admin/manage-users')
  },
  {
    text: 'Manage Course Categories',
    icon: Book,
    color: 'bg-[#BF4BF6]',
    onClick: () => navigate('/admin/course-categories')
  },
  {
    text: "Manage Technologies",
    icon: Cpu,
    color: 'bg-[#BF4BF6]',
    onClick: () => navigate('/admin/manage-tech')
  },
  {
    text: 'View Reports',
    icon: BarChart2,
    color: 'bg-[#BF4BF6]',
    onClick: () => navigate('/admin/analytics')
  }
];