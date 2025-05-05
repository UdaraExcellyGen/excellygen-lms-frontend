import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  BookOpen, 
  GraduationCap, 
  FolderKanban,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

interface Role {
  id: UserRole;
  name: string;
  icon: React.ReactNode;
  dashboardUrl: string;
  description: string;
}

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectRole, loading, initialized } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('RoleSelection component mounted');
    console.log('User:', user);
    console.log('Initialized:', initialized);
    console.log('Loading:', loading);
    
    // Ensure userId is stored in localStorage
    if (user && user.id) {
      localStorage.setItem('userId', user.id);
      console.log('Ensured userId is in localStorage:', user.id);
    }
  }, [user, initialized, loading]);

  // Redirect if no user data
  useEffect(() => {
    if (initialized && !user) {
      console.log('No user found, redirecting to landing page');
      navigate('/');
    }
  }, [user, navigate, initialized]);

  const availableRoles: Role[] = [
    {
      id: UserRole.Admin,
      name: 'Admin',
      icon: <Briefcase className="w-8 h-8" />,
      dashboardUrl: '/admin/dashboard',
      description: 'Manage users, course categories, technologies, and system settings'
    },
    {
      id: UserRole.Learner,
      name: 'Learner',
      icon: <BookOpen className="w-8 h-8" />,
      dashboardUrl: '/learner/dashboard',
      description: 'Access courses, track progress, earn badges, and participate in community'
    },
    {
      id: UserRole.CourseCoordinator,
      name: 'Course Coordinator',
      icon: <GraduationCap className="w-8 h-8" />,
      dashboardUrl: '/coordinator/dashboard',
      description: 'Create and manage courses, quizzes, and learning materials'
    },
    {
      id: UserRole.ProjectManager,
      name: 'Project Manager',
      icon: <FolderKanban className="w-8 h-8" />,
      dashboardUrl: '/project-manager/dashboard',
      description: 'Manage projects, assign employees, and track project progress'
    }
  ];

  const handleRoleSelect = async (role: UserRole) => {
    if (loading) return;
    
    try {
      console.log(`Selecting role: ${role}`);
      
      // Ensure user ID is stored before navigating
      if (user && user.id) {
        localStorage.setItem('userId', user.id);
      }
      
      await selectRole(role);
      // The navigation will be handled by the selectRole function in the auth context
    } catch (error) {
      console.error('Error selecting role:', error);
    }
  };

  // Show loading state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-4">Unable to load user data. Please try logging in again.</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-french-violet text-white rounded-lg hover:bg-indigo transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        {/* Header */}
        <div className="text-center pb-5 border-b border-gray-200 mb-6">
          <h1 className="text-2xl font-semibold text-russian-violet mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-500">
            Select your role to access the dashboard
          </p>
          {/* Removed the User ID display line */}
        </div>

        {/* Role Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map((role) => (
            user.roles.includes(role.id) && (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className="group relative bg-white rounded-xl p-6 border-2 border-gray-200
                         hover:border-[#7A00B8] shadow-sm hover:shadow-lg text-left flex flex-col h-full 
                         transition-all duration-300"
                disabled={loading}
              >
                <div className="flex items-start justify-between mb-5 relative">
                  <div className="p-2 rounded-md bg-french-violet/10 text-french-violet">
                    {role.icon}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#7A00B8] group-hover:translate-x-2 
                                         transition-all duration-300" />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {role.description}
                  </p>
                </div>
              </button>
            )
          ))}
        </div>
        
        {loading && (
          <div className="flex justify-center mt-6">
            <div className="w-8 h-8 border-4 border-french-violet border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;