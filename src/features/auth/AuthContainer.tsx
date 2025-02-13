import React, { useState } from 'react';
import LoginForm from '../../pages/auth/LoginForm';
import ResetPasswordForm from './ResetPasswordForm';

export interface AuthContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<'login' | 'reset'>('login');
  
  console.log('AuthContainer - Current View:', currentView);
  
  if (!isOpen) return null;

  const handleForgotPassword = () => {
    console.log('AuthContainer - Handling forgot password');
    setCurrentView('reset'); 
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl w-full max-w-md p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {currentView === 'login' ? (
          <LoginForm 
            onClose={onClose}
            onForgotPassword={() => {
              console.log('AuthContainer - Calling handleForgotPassword');
              handleForgotPassword();
            }}
          />
        ) : (
          <ResetPasswordForm 
            onClose={onClose}
            onBackToLogin={handleBackToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthContainer;