import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  BarChart,
  Layout,
  Globe,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import AnimatedFeatureCard from './AnimatedFeatureCard';

export interface FeaturesSectionProps {}

const AnimatedFeaturesSection: React.FC<FeaturesSectionProps> = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  
  // Features with translation keys
  const features = [
    {
      icon: BookOpen,
      titleKey: "features.interactiveLearning.title",
      descriptionKey: "features.interactiveLearning.description"
    },
    {
      icon: Users,
      titleKey: "features.employeeManagement.title",
      descriptionKey: "features.employeeManagement.description"
    },
    {
      icon: BarChart,
      titleKey: "features.performanceTracking.title",
      descriptionKey: "features.performanceTracking.description"
    },
    {
      icon: Users,
      titleKey: "features.collaborativeLearning.title",
      descriptionKey: "features.collaborativeLearning.description"
    },
    {
      icon: Layout,
      titleKey: "features.learningPaths.title",
      descriptionKey: "features.learningPaths.description"
    },
    {
      icon: Globe,
      titleKey: "features.multiPlatformIntegration.title",
      descriptionKey: "features.multiPlatformIntegration.description"
    },
    {
      icon: Target,
      titleKey: "features.skillGapAnalysis.title",
      descriptionKey: "features.skillGapAnalysis.description"
    },
    {
      icon: BarChart,
      titleKey: "features.advancedAnalytics.title",
      descriptionKey: "features.advancedAnalytics.description"
    }
  ];
  
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
          {t('features.title')}
        </h2>
        <p 
          ref={descriptionAnimation.ref as React.RefObject<HTMLParagraphElement>}
          className="text-center text-gray-600 mb-16 max-w-2xl mx-auto font-nunito text-lg"
        >
          {t('features.description')}
        </p>
        
        <div 
          ref={gridAnimation.ref as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children"
        >
          {features.map((feature, index) => (
            <AnimatedFeatureCard
              key={index}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
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