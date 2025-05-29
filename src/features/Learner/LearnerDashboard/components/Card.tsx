import React from 'react';
import { CardProps, CardHeaderProps, CardTitleProps, CardContentProps } from '../types/types';

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
  <div className="p-6 pb-3">
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h2 className={`text-lg font-bold ${className}`}>
    {children}
  </h2>
);

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-2 ${className}`}>
    {children}
  </div>
);