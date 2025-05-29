import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
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
    <div className="p-6 border-b border-[#BF4BF6]/20 bg-[#F6E6FF]/20 backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1B0A3F]">Projects</h2>
      </div>
      <div className="grid gap-6">
        {completedProjects.length === 0 ? (
          <p className="text-[#52007C] p-4 bg-white/70 backdrop-blur-md rounded-xl border border-[#BF4BF6]/10 shadow-sm">No completed projects found.</p>
        ) : (
          completedProjects.map((project) => (
            <div key={project.id} className="bg-white/90 backdrop-blur-md rounded-xl p-5 border border-[#BF4BF6]/20 shadow-lg hover:shadow-[0_0_15px_rgba(191,75,246,0.3)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                <div>
                  <h3 className="text-lg font-semibold text-[#1B0A3F]">{project.name}</h3>
                  <p className="text-[#52007C] text-sm mt-1">{project.role}</p>
                </div>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 bg-gradient-to-r from-[#52007C] to-[#BF4BF6] text-white shadow-sm">
                  <CheckCircle className="h-4 w-4" />
                  {project.status}
                </span>
              </div>
              <p className="text-[#1B0A3F] mb-4 bg-[#F6E6FF]/30 p-3 rounded-lg">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies && project.technologies.map((tech, techIndex) => (
                  <span
                    key={`${project.id}-tech-${techIndex}`}
                    className="px-3 py-1 bg-gradient-to-r from-[#7A00B8] to-[#BF4BF6] text-white rounded-full text-sm shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="text-sm text-[#52007C] flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[#BF4BF6]" />
                <span>{project.startDate}</span>
                {project.endDate && (
                  <>
                    <span className="mx-2">-</span>
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