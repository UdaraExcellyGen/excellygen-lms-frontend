import React from 'react';
import { FeatureCardProps } from '../../../types/intex';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface AnimatedFeatureCardProps extends FeatureCardProps {
  delay?: number;
}

const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  onMouseEnter,
  onMouseLeave,
  delay = 0
}) => {
  const cardAnimation = useScrollAnimation({
    type: 'slide',
    direction: 'up',
    duration: 600,
    delay,
    threshold: 0.1
  });

  return (
    <div 
      ref={cardAnimation.ref as React.RefObject<HTMLDivElement>}
      className="p-8 rounded-2xl bg-white hover:bg-gradient-to-br from-[#F6E6FF] to-white transition-all duration-300 hover:shadow-xl group relative overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#BF4BF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="w-14 h-14 bg-[#F6E6FF] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#BF4BF6]/20 transition-colors duration-300">
          <Icon className="w-8 h-8 text-[#BF4BF6]" />
        </div>
        <h3 className="text-xl font-unbounded font-semibold text-[#1B0A3F] mb-3">
          {title}
        </h3>
        <p className="text-gray-600 font-nunito group-hover:text-gray-700">
          {description}
        </p>
      </div>

      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#BF4BF6]/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150" />
    </div>
  );
};

export default AnimatedFeatureCard;