// src/features/Learner/LearnerDashboard/components/Card.tsx
// ENTERPRISE OPTIMIZED: Professional card components with performance optimization
import React from 'react';
import { CardProps, CardHeaderProps, CardTitleProps, CardContentProps } from '../types/types';

// ENTERPRISE: Optimized Card component with memoization
export const Card: React.FC<CardProps> = React.memo(({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-[#BF4BF6]/30 ${className}`}>
    {children}
  </div>
));

// ENTERPRISE: Optimized CardHeader component with memoization
export const CardHeader: React.FC<CardHeaderProps> = React.memo(({ children }) => (
  <div className="p-6 pb-3">
    {children}
  </div>
));

// ENTERPRISE: Optimized CardTitle component with memoization and better styling
export const CardTitle: React.FC<CardTitleProps> = React.memo(({ children, className = '' }) => (
  <h2 className={`text-lg font-bold transition-colors duration-200 ${className}`}>
    {children}
  </h2>
));

// ENTERPRISE: Optimized CardContent component with memoization
export const CardContent: React.FC<CardContentProps> = React.memo(({ children, className = '' }) => (
  <div className={`p-6 pt-2 ${className}`}>
    {children}
  </div>
));

// Set display names for better debugging
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';