import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import heroSvg from '../../../assets/hero.svg';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export interface HeroSectionProps {
  onGetStarted: () => void;
}

const AnimatedHeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  // Use a left-to-right animation for the text content (left side)
  const titleAnimation = useScrollAnimation({ 
    type: 'slide', 
    direction: 'right', // Animate from left to right
    duration: 900,
    delay: 100,
    distance: '80px', // Slightly larger distance for more dramatic effect
  });
  
  const descriptionAnimation = useScrollAnimation({ 
    type: 'slide', 
    direction: 'right',
    duration: 900,
    delay: 300,
    distance: '60px',
  });
  
  const buttonAnimation = useScrollAnimation({ 
    type: 'slide', 
    direction: 'right',
    duration: 900,
    delay: 500,
    distance: '40px',
  });
  
  // Use a right-to-left animation for the image (right side)
  const imageAnimation = useScrollAnimation({ 
    type: 'slide',
    direction: 'left', // Animate from right to left
    duration: 1000,
    delay: 200,
    distance: '100px', // Larger distance for the image
  });
  
  
  // Add animations for the decorative elements
  const topCircleAnimation = useScrollAnimation({ 
    type: 'fade',
    duration: 1200,
    delay: 600,
  });
  
  const bottomCircleAnimation = useScrollAnimation({ 
    type: 'fade',
    duration: 1200,
    delay: 800,
  });
  
  return (
    <section className="min-h-screen pt-24 md:pt-32 flex items-center bg-gradient-to-br from-[#1B0A3F] via-[#3A0A6B] to-[#52007C] relative overflow-hidden animate-gradient-shift">
      {/* Add subtle background decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-[#7A00B8]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#BF4BF6]/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
          <div className="text-white space-y-8">
            <h1 
              ref={titleAnimation.ref as React.RefObject<HTMLHeadingElement>}
              className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold leading-tight"
            >
              Elevate Your Workforce with Modern Learning Solutions
            </h1>
            <p 
              ref={descriptionAnimation.ref as React.RefObject<HTMLParagraphElement>}
              className="text-lg md:text-xl text-gray-300 font-nunito"
            >
              Unite learning and talent development in one powerful platform. 
              Drive employee growth, track performance, and build a culture of continuous learning.
            </p>
            <div 
              ref={buttonAnimation.ref as React.RefObject<HTMLDivElement>}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={onGetStarted}
                className="px-6 py-3 bg-phlox hover:bg-heliotrope text-white rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button> 
            </div>
          </div>

          <div 
            ref={imageAnimation.ref as React.RefObject<HTMLDivElement>}
            className="relative"
          >
            <div className="bg-[#BF4BF6]/10 backdrop-blur-md rounded-2xl p-4 md:p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="h-64 md:h-96 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] rounded-xl shadow-2xl flex items-center justify-center">
                <img 
                  src={heroSvg} 
                  alt="Learning Platform"
                  className="w-full h-full object-cover rounded-lg shadow-2xl"
                />
              </div>
            </div>
            
            <div 
              ref={topCircleAnimation.ref as React.RefObject<HTMLDivElement>}
              className="absolute -top-8 -right-8 w-12 md:w-16 h-12 md:h-16 bg-[#D68BF9] rounded-full opacity-0 animate-float" 
            />
            <div 
              ref={bottomCircleAnimation.ref as React.RefObject<HTMLDivElement>}
              className="absolute -bottom-8 -left-8 w-16 md:w-24 h-16 md:h-24 bg-[#7A00B8] rounded-full opacity-0 animate-float-delay" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedHeroSection;