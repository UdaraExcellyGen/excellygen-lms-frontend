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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      {/* Increased total height to h-40 (10rem) to comfortably fit the new structure with padding. */}
      <div className="relative h-40 bg-gradient-to-br from-[#52007C] to-[#BF4BF6] p-6 flex flex-col justify-start">
        <div className="absolute inset-0 flex items-center justify-center">
          <Briefcase className="h-16 w-16 text-white/20" />
        </div>
        
        <div className="relative z-10">
          {/* Title Area: Fixed height for 2 lines of 'text-lg'. (h-14 = 3.5rem) */}
          <div className="h-14">
            <h3 className="text-lg font-semibold text-white" title={project.title}>
              {project.title}
            </h3>
          </div>
          
          {/* THE FIX: Description Area with its own fixed height for 2 lines of 'text-sm'. (h-10 = 2.5rem) */}
          <div className="h-10 mt-1">
            <p className="text-[#D68BF9] text-sm line-clamp-2">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-grow">
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