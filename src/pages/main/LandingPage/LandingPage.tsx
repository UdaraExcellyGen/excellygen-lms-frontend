import React, { useState } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  BarChart,
  Layout,
  Globe,
  Target
} from 'lucide-react';
import NavBar from '../../../components/Layout/Navbar/NavBar';
import Footer from '../../../components/Layout/Footer/Footer';
import LoginModal from '../LoginModal/LoginModal';
import heroSvg from '../../assets/hero.svg'

const LandingPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F6E6FF]">
      <NavBar className="absolute top-0 left-0 right-0 z-50" />
      <main className="flex-grow">
        
        <section className="h-screen flex items-center bg-gradient-to-br from-[#1B0A3F] to-[#52007C] relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="text-white space-y-8">
                <h1 className="text-5xl md:text-6xl font-sans font-bold leading-tight">
                  Elevate Your Workforce with Modern Learning Solutions
                </h1>
                <p className="text-xl text-gray-300 font-nunito">
                  Unite learning and talent development in one powerful platform. 
                  Drive employee growth, track performance, and build a culture of continuous learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleGetStarted}
                    className="px-6 py-3 bg-phlox hover:bg-heliotrope text-white rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button> 
                </div>
              </div>

             
              <div className="relative">
                <div className="bg-[#BF4BF6]/10 backdrop-blur-md rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="h-96 bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] rounded-xl shadow-2xl flex items-center justify-center">
                    <img 
                      src={heroSvg} 
                      alt="Learning Platform"
                      className="w-full h-full object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
               
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#D68BF9] rounded-full opacity-50 animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#7A00B8] rounded-full opacity-50 animate-pulse delay-300" />
              </div>
            </div>
          </div>
        </section>

        
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
                  {/* Animated Background */}
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

                  {/* Corner Accent */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#BF4BF6]/10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-150" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default LandingPage;