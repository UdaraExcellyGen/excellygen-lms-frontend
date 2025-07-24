// Path: src/features/ProjectManager/Employee-assign/components/ProjectCard.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaProjectDiagram, FaChevronUp, FaChevronDown, FaUserCircle, FaTrashAlt, FaLaptopCode, FaEdit } from 'react-icons/fa';
import { Project, Employee } from '../types/types';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  isExpanded: boolean;
  employees: Employee[];
  handleProjectSelect: (project: Project) => void;
  toggleProjectExpansion: (projectId: string) => void;
  triggerRemoveConfirmation: (assignmentId: number, employeeId: string, employeeName: string, projectName: string, role: string, workloadPercentage: number) => void;
  triggerEditAssignment: (assignment: {
    id: number;
    employeeName: string;
    projectName: string;
    role: string;
    workloadPercentage: number;
    employeeId: string;
  }) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  isSelected, 
  isExpanded, 
  employees,
  handleProjectSelect,
  toggleProjectExpansion,
  triggerRemoveConfirmation,
  triggerEditAssignment
}) => {
  const { t } = useTranslation();
  
  const getRoleCount = (roleName: string) => {
    return project.employeeAssignments.filter(assignment => assignment.role === roleName).length;
  };

  return (
    <div
      className={`rounded-xl transition-all bg-white
        ${isSelected
            ? 'border-2 border-[#F6E6FF] overflow-hidden'
             : 'border-2 p-6 border-[#F6E6FF] dark:border-[#7A00B8] hover:border-[#D68BF9]'
        }`}
    >
      {isSelected && (
        <div className="bg-[#BF4BF6] p-2 text-white text-xs font-bold text-center">
          {t('projectManager.cards.selectedProject')}
        </div>
      )}
      <div className={isSelected ? 'p-6' : ''}>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => handleProjectSelect(project)}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center
                bg-gray-100 dark:bg-gray-900`}
            >
              <FaProjectDiagram
                className={`w-6 h-6 text-gray-500`}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-[#52007C] dark:text-white">
                {project.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-[#7A00B8] dark:text-[#D68BF9]">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs
                    ${project.status === 'Active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : project.status === 'Completed'
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                >
                  {project.status === "Active" ? t('projectManager.employeeAssign.active') : t('projectManager.employeeAssign.completed')}
                </span>
                <span>•</span>
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-[#7A00B8] dark:text-[#D68BF9] mt-1">
                {project.shortDescription}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleProjectExpansion(project.id);
            }}
            className="p-2 hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F] rounded-lg transition-colors"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-[#7A00B8] dark:text-[#D68BF9]">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#F6E6FF]">
                <div className="text-sm text-[#52007C] dark:text-[#D68BF9] mb-2">
                  {t('projectManager.cards.deadline')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[#52007C] dark:text-white">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#F6E6FF]">
                <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-1">
                  {t('projectManager.cards.requiredTechnologies')}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 text-xs rounded-md bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-2 group"
                    >
                      <FaLaptopCode className="w-3 h-3" />
                      <span>{skill.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-3">
                {t('projectManager.cards.requiredRoles')}
              </h5>
              <div className="space-y-2 p-4 rounded-lg bg-[#F6E6FF]">
                {project.requiredRoles.map((roleItem, index) => {
                  const assignedCount = getRoleCount(roleItem.roleName);
                  const remainingCount = Math.max(0, roleItem.count - assignedCount);
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-[#7A00B8] dark:text-[#D68BF9]">
                        {roleItem.roleName}:
                      </span>
                      <span className="font-medium text-[#52007C] dark:text-white">
                        {t('projectManager.cards.needed')} {remainingCount} ({t('projectManager.cards.total')} {roleItem.count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-3">
                {t('projectManager.cards.teamMembers')} ({project.employeeAssignments.length})
              </h5>
              
              {project.employeeAssignments.length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-[#F6E6FF]">
                  <h6 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-2">
                    {t('projectManager.dialogs.workloadDistribution')}
                  </h6>
                  <div className="space-y-3">
                    {/* Group assignments by employee */}
                    {Object.entries(project.employeeAssignments.reduce((acc, assignment) => {
                      const employeeId = assignment.employeeId;
                      if (!acc[employeeId]) {
                        acc[employeeId] = [];
                      }
                      acc[employeeId].push(assignment);
                      return acc;
                    }, {} as Record<string, typeof project.employeeAssignments>)).map(([employeeId, assignments]) => {
                      const employee = employees.find(e => e.id === employeeId);
                      if (!employee) return null;
                      
                      // Calculate total allocation for this employee in this project
                      const totalAllocation = assignments.reduce((sum, assignment) => 
                        sum + assignment.workloadPercentage, 0);
                      
                      return (
                        <div key={`workload-${employeeId}`} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#52007C] dark:text-white font-medium">{employee.name}</span>
                            <span className="text-[#7A00B8] dark:text-[#D68BF9]">{totalAllocation}% {t('projectManager.cards.total')}</span>
                          </div>
                          <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#52007C] to-[#BF4BF6]"
                              style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                            />
                          </div>
                          <div className="pl-2 flex flex-wrap gap-2 mt-1">
                            {assignments.map((assignment, index) => (
                              <div key={index} className="text-xs px-2 py-1 bg-white rounded-full">
                                {assignment.role}: {assignment.workloadPercentage}%
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-2 p-4 rounded-lg bg-[#F6E6FF]">
                {/* Show each assignment separately */}
                {project.employeeAssignments.map((assignment) => {
                  const employee = employees.find((e) => e.id === assignment.employeeId);
                  return employee ? (
                    <div
                      key={`${assignment.employeeId}-${assignment.role}-${assignment.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F6E6FF] flex items-center justify-center">
                          <FaUserCircle className="w-5 h-5 text-[#BF4BF6]" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-[#52007C] dark:text-white">
                            {assignment.employeeName}
                          </span>
                          <p className="text-xs text-[#7A00B8] dark:text-[#D68BF9]">
                            {assignment.role} • {assignment.workloadPercentage}% {t('projectManager.cards.allocation')}
                          </p>
                          <span className="text-xs text-[#7A00B8] dark:text-[#D68BF9]">({t('projectManager.employeeAssign.id')}: {employee.id})</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerEditAssignment({
                              id: assignment.id,
                              employeeName: assignment.employeeName,
                              projectName: project.name,
                              role: assignment.role,
                              workloadPercentage: assignment.workloadPercentage,
                              employeeId: assignment.employeeId
                            });
                          }}
                          className="px-2 py-1 hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F]
                            rounded transition-colors text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
                          title={t('projectManager.cards.edit')}
                        >
                          <FaEdit className="w-4 h-4" />
                          <span className="sr-only">{t('projectManager.cards.edit')}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // ✅ UPDATED: Pass specific assignment details instead of just employee details
                            triggerRemoveConfirmation(
                              assignment.id,
                              assignment.employeeId, 
                              assignment.employeeName, 
                              project.name,
                              assignment.role,
                              assignment.workloadPercentage
                            );
                          }}
                          className="px-2 py-1 hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F]
                            rounded transition-colors text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500"
                          title={t('projectManager.cards.remove')}
                        >
                          <FaTrashAlt className="w-4 h-4" />
                          <span className="sr-only">{t('projectManager.cards.remove')}</span>
                        </button>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;