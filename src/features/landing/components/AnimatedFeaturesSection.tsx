import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  BarChart,
  Layout,
  Globe,
  Target
} from 'lucide-react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import AnimatedFeatureCard from './AnimatedFeatureCard';

// Import features directly from the original component
// or copy the feature data directly here to avoid dependency issues
const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description: "Engage with interactive content, quizzes, and assessments."
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Comprehensive tools for tracking employee skills, projects, and development paths."
  },
  {
    icon: BarChart,
    title: "Performance Tracking",
    description: "Monitor employee progress, bench status, and project assignments in real-time."
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Connect with peers and experts through discussion forums."
  },
  {
    icon: Layout,
    title: "Learning Paths",
    description: "Customized learning paths based on job roles and departments."
  },
  {
    icon: Globe,
    title: "Multi-Platform Integration",
    description: "Seamless integration with LinkedIn Learning, Coursera, and Udemy."
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description: "Personalized recommendations based on industry benchmarks."
  },
  {
    icon: BarChart,
    title: "Advanced Analytics",
    description: "Detailed reports and predictive learning trends."
  }
];

export interface FeaturesSectionProps {}

const AnimatedFeaturesSection: React.FC<FeaturesSectionProps> = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  
  // Animation for the section title
  const titleAnimation = useScrollAnimation({
    type: 'fade',
    duration: 800
  });
  
  // Animation for the description
  const descriptionAnimation = useScrollAnimation({
    type: 'fade',
    duration: 800,
    delay: 200
  });
  
  // Animation for the grid container
  const gridAnimation = useScrollAnimation({
    type: 'fade',
    duration: 500
  });

  return (
    <section className="py-20 px-4 bg-[#F6E6FF]">
      <div className="container mx-auto">
        <h2 
          ref={titleAnimation.ref as React.RefObject<HTMLHeadingElement>}
          className="text-4xl font-unbounded font-bold text-center text-[#1B0A3F] mb-4"
        >
          Features
        </h2>
        <p 
          ref={descriptionAnimation.ref as React.RefObject<HTMLParagraphElement>}
          className="text-center text-gray-600 mb-16 max-w-2xl mx-auto font-nunito text-lg"
        >
          Experience the next generation of corporate learning with our comprehensive suite of features
        </p>
        
        <div 
          ref={gridAnimation.ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children"
        >
          {features.map((feature, index) => (
            <AnimatedFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
              delay={100 * (index % 4)} // Staggered delay for each column
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedFeaturesSection;