import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { ProfileData } from '../types';

interface ProjectsListProps {
  profileData: ProfileData;
  viewOnly?: boolean;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  profileData,
  viewOnly = false
}) => {
  // Only show completed projects
  const completedProjects = profileData.projects.filter(project => project.status === 'Completed');

  return (
    <div className="p-4 sm:p-8 border-b">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Projects</h2>
      </div>
      <div className="grid gap-6">
        {completedProjects.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed projects found.</p>
        ) : (
          completedProjects.map((project) => (
            <div key={project.id} className="bg-[#F6E6FF] rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                <div>
                  <h3 className="text-lg font-medium text-[#1B0A3F]">{project.name}</h3>
                  <p className="text-[#52007C] text-sm mt-1">{project.role}</p>
                </div>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 bg-[#52007C] text-white">
                  <CheckCircle className="h-4 w-4" />
                  {project.status}
                </span>
              </div>
              <p className="text-[#1B0A3F] mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, techIndex) => (
                  <span
                    key={`${project.id}-tech-${techIndex}`}
                    className="px-3 py-1 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-[#52007C]">
                <span>{project.startDate}</span>
                {project.endDate && (
                  <>
                    <span> - </span>
                    <span>{project.endDate}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsList;