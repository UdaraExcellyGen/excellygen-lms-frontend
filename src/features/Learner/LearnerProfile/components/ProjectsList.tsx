import React from 'react';
import { Project } from '../types';
import { Briefcase, CheckCircle, Calendar } from 'lucide-react';

const ProjectsList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">Project Experience</h3>
      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            // THIS IS THE FIX: Using a combination of id and index for a guaranteed unique key.
            <div key={`${project.id}-${index}`}>
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h4 className="font-bold text-gray-800">{project.name}</h4>
                        <p className="text-sm text-indigo-600 font-medium">{project.role}</p>
                    </div>
                    {project.status === 'Completed' && (
                      <span className="text-xs font-semibold inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                          <CheckCircle size={14} className="mr-1.5"/>
                          Completed
                      </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 my-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                        <span key={tech} className="text-xs bg-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-md">{tech}</span>
                    ))}
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Briefcase size={32} className="mx-auto mb-2"/>
            <p>No project experience to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;