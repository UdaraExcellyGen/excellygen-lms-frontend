import React from 'react';
import { ArrowRight } from 'lucide-react';
import heroSvg from '../../../assets/hero.svg';

export interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="min-h-screen pt-24 md:pt-32 flex items-center bg-gradient-to-br from-[#1B0A3F] to-[#52007C] relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
          <div className="text-white space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold leading-tight">
              Elevate Your Workforce with Modern Learning Solutions
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-nunito">
              Unite learning and talent development in one powerful platform. 
              Drive employee growth, track performance, and build a culture of continuous learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onGetStarted}
                className="px-6 py-3 bg-phlox hover:bg-heliotrope text-white rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button> 
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#BF4BF6]/10 backdrop-blur-md rounded-2xl p-4 md:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="h-64 md:h-96 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] rounded-xl shadow-2xl flex items-center justify-center">
                <img 
                  src={heroSvg} 
                  alt="Learning Platform"
                  className="w-full h-full object-cover rounded-lg shadow-2xl"
                />
              </div>
            </div>
            
            <div className="absolute -top-8 -right-8 w-12 md:w-16 h-12 md:h-16 bg-[#D68BF9] rounded-full opacity-50 animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-16 md:w-24 h-16 md:h-24 bg-[#7A00B8] rounded-full opacity-50 animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;