import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, currentRole, initialized, loading } = useAuth();
  const location = useLocation();

  // Show loading if auth not initialized yet
  if (!initialized || loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-[#52007C] to-[#34137C]">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Special case for role selection - just check if user is logged in
  if (location.pathname === '/role-selection') {
    if (!user) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If there are allowed roles specified, check if the user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!currentRole || !allowedRoles.includes(currentRole)) {
      // If user has multiple roles but not the right one for this route, 
      // redirect to role selection
      if (user.roles.length > 1) {
        return <Navigate to="/role-selection" state={{ from: location }} replace />;
      }
      
      // Otherwise redirect to landing
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;