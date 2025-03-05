import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-16">
      <h1 className="text-3xl text-center font-bold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-[#D68BF9] text-center mt-1">
        {subtitle}
      </p>
    </div>
  );
};

export default PageHeader;