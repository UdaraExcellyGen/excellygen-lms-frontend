// src/features/Learner/BadgesAndRewards/components/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold text-white font-unbounded md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl mx-auto mt-3 text-lg text-heliotrope font-nunito">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;