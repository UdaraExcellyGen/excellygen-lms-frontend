// src/features/Learner/BadgesAndRewards/components/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-16">
      <h1 className="text-3xl md:text-4xl text-center font-bold text-white font-unbounded">
        {title}
      </h1>
      <p className="text-center mt-1 font-nunito text-heliotrope">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;