import React from 'react';
import { Award } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Award size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Technical Skills</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:shadow-md transition-shadow duration-200">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;