import React, { useState } from 'react';
import LoginForm from './LoginForm';
import ResetPasswordForm from './ResetPasswordForm';

interface AuthContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

enum AuthView {
  LOGIN,
  RESET_PASSWORD
}

const AuthContainer: React.FC<AuthContainerProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.LOGIN);

  const handleForgotPassword = () => {
    setCurrentView(AuthView.RESET_PASSWORD);
  };

  const handleBackToLogin = () => {
    setCurrentView(AuthView.LOGIN);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {currentView === AuthView.LOGIN ? (
          <LoginForm 
            onClose={onClose}
            onForgotPassword={handleForgotPassword}
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