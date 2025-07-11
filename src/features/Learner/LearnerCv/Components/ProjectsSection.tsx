import React from 'react';
import { ProfileProject } from '../types/types';

interface ProjectsSectionProps {
  projects: ProfileProject[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  return (
    <section className="mb-4">
      {/* UPDATED: Header background, border, and text color */}
      <div className="bg-[#2a135b] text-white p-2 mb-3">
        <h3 className="text-base font-bold">Projects</h3>
      </div>
      <div className="bg-white">
        {projects.map((project, index) => (
          <div key={index} className="border-l-4 border-[#1B0A3F] p-4 mb-3 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800 mb-1">{project.title}</h4>
                <p className="text-gray-600 text-xs mb-2">{project.description}</p>
                <p className="text-xs font-bold text-[#1B0A3F]">
                  {project.technologies.join(' • ')}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-xs text-gray-500">
                  <p className="font-bold">{new Date(project.startDate).toLocaleDateString()}</p>
                  <p className="font-bold">
                    {project.status === 'Completed' && project.completionDate
                      ? new Date(project.completionDate).toLocaleDateString()
                      : 'Present'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;