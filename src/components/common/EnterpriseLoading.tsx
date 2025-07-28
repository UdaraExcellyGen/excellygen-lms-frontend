// src/components/common/EnterpriseLoading.tsx
// ENTERPRISE: Local loading components like Google/Microsoft
import React from 'react';

// ENTERPRISE: Google-style progress bar (for global operations)
export const ProgressBar: React.FC<{ isLoading: boolean; className?: string }> = ({ 
  isLoading, 
  className = '' 
}) => {
  if (!isLoading) return null;

  return (
    <div className={`h-1 w-full bg-gray-200 overflow-hidden ${className}`}>
      <div className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] animate-pulse">
        <div className="h-full w-full bg-white/30 animate-shimmer"></div>
      </div>
    </div>
  );
};

// ENTERPRISE: Microsoft-style local spinner
export const LocalSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}> = ({ 
  size = 'md', 
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2', 
    lg: 'w-8 h-8 border-3'
  };

  const colorClasses = {
    primary: 'border-[#BF4BF6]/30 border-t-[#BF4BF6]',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-300 border-t-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}></div>
  );
};

// ENTERPRISE: Google Drive-style card loading
export const CardLoader: React.FC<{ 
  isLoading: boolean; 
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className = '' }) => (
  <div className={`relative ${className}`}>
    {children}
    {isLoading && (
      <div className="absolute top-3 right-3">
        <LocalSpinner size="sm" color="primary" />
      </div>
    )}
  </div>
);

// ENTERPRISE: Microsoft-style button loading
export const LoadingButton: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  children, 
  isLoading = false, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`relative flex items-center justify-center gap-2 ${className}`}
  >
    {isLoading && (
      <LocalSpinner size="sm" color="white" />
    )}
    <span className={isLoading ? 'opacity-70' : 'opacity-100'}>
      {children}
    </span>
  </button>
);

// ENTERPRISE: Google Forms-style input loading
export const LoadingInput: React.FC<{
  isValidating?: boolean;
  error?: string;
  success?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isValidating, error, success, children, className = '' }) => (
  <div className={`relative ${className}`}>
    {children}
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
      {isValidating && <LocalSpinner size="sm" color="primary" />}
      {success && !isValidating && (
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {error && !isValidating && (
        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  </div>
);

// ENTERPRISE: Table/List loading skeleton (like Gmail)
export const SkeletonRow: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 3, 
  className = '' 
}) => (
  <div className={`flex gap-4 p-4 ${className}`}>
    {Array(columns).fill(0).map((_, i) => (
      <div key={i} className="flex-1">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

// ENTERPRISE: Content skeleton (like LinkedIn)
export const ContentSkeleton: React.FC<{ 
  lines?: number; 
  avatar?: boolean;
  className?: string;
}> = ({ 
  lines = 3, 
  avatar = false, 
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="flex gap-3 mb-3">
      {avatar && <div className="w-10 h-10 bg-gray-200 rounded-full"></div>}
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
    </div>
    <div className="space-y-2">
      {Array(lines).fill(0).map((_, i) => (
        <div 
          key={i} 
          className={`h-3 bg-gray-200 rounded ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  </div>
);

// ENTERPRISE: Page transition loader (like YouTube)
export const PageTransition: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <ProgressBar isLoading={true} />
    </div>
  );
};