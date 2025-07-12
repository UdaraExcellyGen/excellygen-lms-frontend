import React from 'react';

interface SkillsSectionProps {
  skills: string[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <section className="mb-4">
      <div className="bg-blue-900 text-white p-2 mb-3">
        <h3 className="text-base font-bold">Technical Skills</h3>
      </div>
      <div className="bg-white border-l-4 border-blue-900 p-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-900 text-xs rounded font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;