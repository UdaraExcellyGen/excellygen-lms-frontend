// src/features/Learner/BadgesAndRewards/components/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        {title}
      </h1>
      <p className="text-base text-[#D68BF9] mt-2">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;