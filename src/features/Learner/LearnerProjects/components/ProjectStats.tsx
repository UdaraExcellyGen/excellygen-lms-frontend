import React from 'react';
import { 
  Briefcase,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Project } from '../types/Project';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

export const ProjectStats = ({ projects }: { projects: Project[] }) => {
  const statsItems: StatItem[] = [
    { 
      icon: Briefcase, 
      label: 'Total Projects', 
      value: projects.length.toString(),
      color: 'from-[#BF4BF6] to-[#7A00B8]'
    },
    { 
      icon: Clock, 
      label: 'Assigned', 
      value: projects.filter(p => p.status === 'Assigned').length.toString(),
      color: 'from-[#D68BF9] to-[#BF4BF6]'
    },
    { 
      icon: CheckCircle2, 
      label: 'Completed', 
      value: projects.filter(p => p.status === 'Completed').length.toString(),
      color: 'from-[#7A00B8] to-[#52007C]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {statsItems.map((stat, index) => (
        <div 
          key={index}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:border-[#BF4BF6]/40 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[#52007C] font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1B0A3F] mt-1">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};