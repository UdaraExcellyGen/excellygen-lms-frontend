import { User } from '../types';

// Export named functions and constants
export const formatRoleName = (role: string): string => {
  switch (role) {
    case 'coordinator': return 'Coordinator';
    case 'project_manager': return 'Project Manager';
    case 'learner': return 'Learner';
    case 'admin': return 'Admin';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'coordinator': return 'bg-blue-100 text-blue-800';
    case 'learner': return 'bg-green-100 text-green-800';
    case 'project_manager': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const roleOptions = ['learner', 'admin', 'coordinator', 'project_manager'];

export const initialUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    roles: ['coordinator', 'admin'],
    department: 'Software Engineering',
    status: 'active',
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    roles: ['learner'],
    department: 'Data Science',
    status: 'active',
    joinedDate: '2024-02-01'
  }
];