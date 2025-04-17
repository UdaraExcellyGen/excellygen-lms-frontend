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
  const { user, currentRole, initialized } = useAuth();
  const location = useLocation();

  // Wait for auth to initialize
  if (!initialized) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-french-violet border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are specified and current role is not allowed, redirect to role selection
  if (allowedRoles && currentRole && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/role-selection" replace />;
  }

  // Render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;