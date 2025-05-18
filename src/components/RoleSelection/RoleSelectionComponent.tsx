// Path: src/components/RoleSelection/RoleSelectionComponent.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Update the path based on your actual auth context

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const RoleSelectionComponent: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserRole } = useAuth(); // Assuming your auth context has these properties
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load the current role from localStorage when component mounts
  useEffect(() => {
    const storedRole = localStorage.getItem('current_role');
    if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, []);
  
  // Define available roles based on the user's permissions
  const availableRoles: Role[] = [
    {
      id: 'Admin',
      name: 'Admin',
      description: 'Manage users, course categories, technologies, and system settings',
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      path: '/admin/dashboard'
    },
    {
      id: 'ProjectManager',
      name: 'Project Manager',
      description: 'Manage projects, assign employees, and track project progress',
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      path: '/project-manager/dashboard'
    },
    {
      id: 'Learner',
      name: 'Learner',
      description: 'Access courses, track progress, earn badges, and participate in community',
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/learner/dashboard'
    },
    {
      id: 'CourseCoordinator',
      name: 'Course Coordinator',
      description: 'Create and manage courses, quizzes, and learning materials',
      icon: (
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: '/course-coordinator/dashboard'
    }
  ];
  
  // Filter roles based on user's permissions
  const userRoles = currentUser?.roles || [];
  const filteredRoles = availableRoles.filter(role => 
    userRoles.includes(role.id) || userRoles.includes(role.name)
  );
  
  // Handle role selection
  const handleRoleSelect = async (role: Role) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Store the role in localStorage with correct format
      localStorage.setItem('current_role', role.id);
      
      // Update the role in the auth context if needed
      if (updateUserRole) {
        await updateUserRole(role.id);
      }
      
      // Add a log to help debug
      console.log(`Role selected: ${role.id}, navigating to: ${role.path}`);
      
      // Navigate to the appropriate dashboard
      navigate(role.path);
    } catch (err: any) {
      console.error('Error selecting role:', err);
      setError(err.message || 'Error selecting role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#52007C] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full p-6 md:p-8">
        <h1 className="text-3xl text-center font-['Unbounded'] text-[#1B0A3F] mb-3">
          Welcome, {currentUser?.name || 'User'}
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          Select your role to access the dashboard
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              onClick={() => !isLoading && handleRoleSelect(role)}
              className={`
                relative p-6 border rounded-xl transition-all duration-300 cursor-pointer
                ${selectedRole === role.id 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {role.icon}
                </div>
                <div>
                  <h3 className="text-xl font-['Unbounded'] text-[#1B0A3F] mb-1">
                    {role.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>
              </div>
              
              {/* Selection indicator */}
              {selectedRole === role.id && (
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isLoading && (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionComponent;