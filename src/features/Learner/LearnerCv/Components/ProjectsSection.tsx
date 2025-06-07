// src/features/Learner/LearnerCv/Components/ProjectsSection.tsx
import React from 'react';
import { Calendar, Briefcase } from 'lucide-react';
import { Project } from '../types/types';

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Briefcase size={16} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Projects</h3>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project, index) => (
          <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-800">{project.title}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'Completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-purple-500" />
                <span className="text-sm text-gray-600">
                  {new Date(project.startDate).toLocaleDateString()} - {
                    project.status === 'Completed' 
                      ? new Date(project.completionDate!).toLocaleDateString()
                      : 'Present'
                  }
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;