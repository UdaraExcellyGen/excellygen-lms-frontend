// src/features/Learner/CourseCategories/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold font-unbounded mb-4 text-white">
        Choose Your Course Category
      </h1>
      <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto leading-relaxed font-nunito">
        Explore our comprehensive Course Categories designed to help you achieve your career goals
      </p>
    </div>
  );
};

export default Header;