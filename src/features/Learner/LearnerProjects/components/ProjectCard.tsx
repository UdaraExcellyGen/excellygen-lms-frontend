import React from 'react'; 
import { 
  CheckCircle2,
  Calendar,
  Users,
  Briefcase,
  Clock 
} from 'lucide-react'; 
import { Project } from '../types/Project';  

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-50 text-green-600';
    case 'Assigned':
      return 'bg-blue-50 text-blue-600';
    default:
      return 'bg-gray-50 text-gray-600';
  }
};

export const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] p-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <Briefcase className="h-20 w-20 text-white/20" />
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <p className="text-[#D68BF9] mt-1">{project.description}</p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Started: {project.startDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {project.status === 'Completed' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed on {project.completionDate}</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Expected completion: {project.endDate}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>Team: {project.team.join(', ')}</span>
          </div>
          
          {project.role && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Briefcase className="h-4 w-4" />
              <span>Your Role: {project.role}</span>
            </div>
          )}
          
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mt-3">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-[#F6E6FF] text-[#52007C] text-xs rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};