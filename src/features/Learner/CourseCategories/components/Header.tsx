// src/features/Learner/CourseCategories/components/Header.tsx
// ENTERPRISE OPTIMIZED: Professional header with smooth animations
import React from 'react';

// ENTERPRISE: Optimized header component with professional animations
const Header: React.FC = React.memo(() => {
  return (
    <div className="text-center mb-8">
      <div className="transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl md:text-4xl font-bold font-unbounded mb-4 text-white transition-colors duration-300 hover:text-[#D68BF9]">
          Choose Your Course Category
        </h1>
      </div>
      <div className="transform transition-all duration-700 delay-200">
        <p className="text-[#D68BF9] text-lg max-w-2xl mx-auto leading-relaxed font-nunito transition-all duration-300 hover:text-white">
          Explore our comprehensive Course Categories designed to help you achieve your career goals
        </p>
      </div>
      
      {/* ENTERPRISE: Subtle decorative elements */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array(3).fill(0).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 bg-[#D68BF9] rounded-full opacity-60 animate-pulse`}
            style={{ 
              animationDelay: `${index * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;