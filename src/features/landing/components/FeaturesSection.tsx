import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  BarChart,
  Layout,
  Globe,
  Target
} from 'lucide-react';

export interface FeaturesSectionProps {}

interface Feature {
  icon: React.FC<any>;
  title: string;
  description: string;
}

const features: Feature[] = [
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

const FeaturesSection: React.FC<FeaturesSectionProps> = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[#F6E6FF]">
      <div className="container mx-auto">
        <h2 className="text-4xl font-unbounded font-bold text-center text-[#1B0A3F] mb-4">
          Features
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto font-nunito text-lg">
          Experience the next generation of corporate learning with our comprehensive suite of features
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl bg-white hover:bg-gradient-to-br from-[#F6E6FF] to-white transition-all duration-300 hover:shadow-xl group relative overflow-hidden"
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#BF4BF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#F6E6FF] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#BF4BF6]/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-[#BF4BF6]" />
                </div>
                <h3 className="text-xl font-unbounded font-semibold text-[#1B0A3F] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-nunito group-hover:text-gray-700">
                  {feature.description}
                </p>
              </div>

              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#BF4BF6]/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;