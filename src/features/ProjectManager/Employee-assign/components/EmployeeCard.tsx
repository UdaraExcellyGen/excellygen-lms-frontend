// Path: src/features/ProjectManager/Employee-assign/components/EmployeeCard.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaBriefcase, FaCertificate, FaGraduationCap, FaProjectDiagram, FaRegFileCode, FaLaptopCode } from 'react-icons/fa';
import { Employee, Project } from '../types/types';

interface EmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  projects: Project[];
  handleEmployeeSelect: (id: string) => void;
  handleOpenProjectDetails: (project: Project) => void;
  isDisabled: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  isSelected, 
  projects,
  handleEmployeeSelect,
  handleOpenProjectDetails,
  isDisabled
}) => {
  const { t } = useTranslation();
  
  const assignedProjectsDetails = employee.activeProjects
    .map(projectName => projects.find(project => project.name === projectName))
    .filter(Boolean) as Project[];

  return (
    <div
      onClick={() => !isDisabled && handleEmployeeSelect(employee.id)}
      className={`group rounded-xl transition-all cursor-pointer hover:shadow-lg bg-white
        ${isSelected
          ? 'border-2 border-[#F6E6FF] overflow-hidden'
          : 'p-6 border-2 border-[#F6E6FF] dark:border-[#7A00B8] hover:border-[#D68BF9]'
        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSelected && (
        <div className="bg-[#BF4BF6] p-2 text-white text-xs font-bold text-center">
          {t('projectManager.cards.selectedEmployee')}
        </div>
      )}
      <div className={isSelected ? 'p-6' : ''}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#BF4BF6] to-[#D68BF9] p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <FaUserCircle className="w-10 h-10 text-[#BF4BF6] dark:text-[#D68BF9]" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#52007C] dark:text-white">
              {employee.name}
              <span className="ml-2 text-sm font-normal text-[#7A00B8] dark:text-[#D68BF9]">
                ({t('projectManager.employeeAssign.id')}: {employee.id})
              </span>
            </h3>
            <div className="flex items-center gap-2 text-sm text-[#7A00B8] dark:text-[#D68BF9]">
              <FaBriefcase className="w-4 h-4" />
              <span>{employee.role}</span>
            </div>
            {/* Workload progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#F6E6FF] rounded-full">
                <span className="text-xs text-[#52007C] font-medium">{t('projectManager.cards.workloadLabel')} {employee.currentWorkloadPercentage}%</span>
              </div>
              {employee.currentWorkloadPercentage >= 100 ? (
                <span className="text-xs text-red-600 font-medium px-2 py-0.5 bg-red-50 rounded-full">{t('projectManager.dialogs.fullyAllocated')}</span>
              ) : (
                <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded-full">
                  {employee.availableWorkloadPercentage}% {t('projectManager.dialogs.available')}
                </span>
              )}
            </div>
            
            {/* Show progress bar for workload */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full ${employee.currentWorkloadPercentage >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-700 to-purple-400'}`}
                style={{ width: `${Math.min(employee.currentWorkloadPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {employee.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 text-xs rounded-md bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-2 group"
            >
              <FaLaptopCode className="w-3 h-3" />
              <span>{skill}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <div className="w-1/2">
          <h6 className="text-sm font-semibold text-[#7A00B8] dark:text-[#D68BF9] mb-2 flex items-center gap-2">
            <FaCertificate className="w-4 h-4" />
            {t('projectManager.cards.currentAssignments')}
          </h6>
          {employee.currentAssignments.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {employee.currentAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="p-2 rounded-lg bg-white
                    text-sm text-[#52007C] dark:text-white"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FaGraduationCap className="w-4 h-4 text-[#BF4BF6] dark:text-[#D68BF9]" />
                    {assignment.projectName} - {assignment.role} ({assignment.workloadPercentage}%)
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[#7A00B8] dark:text-[#D68BF9]">
              {t('projectManager.cards.noCurrentAssignments')}
            </p>
          )}
        </div>

        <div className="w-1/2">
          <h6 className="text-sm font-semibold text-[#7A00B8] dark:text-[#D68BF9] mb-2 flex items-center gap-2">
            <FaProjectDiagram className="w-4 h-4" />
            {t('projectManager.cards.activeProjects')}
          </h6>
          {assignedProjectsDetails.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {assignedProjectsDetails.map((project) => (
                <div
                  key={project.id}
                  className="p-2 rounded-lg bg-white
                    text-sm text-[#52007C] dark:text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FaRegFileCode className="w-4 h-4 text-[#BF4BF6] dark:text-[#D68BF9]" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProjectDetails(project);
                      }}
                      className="hover:underline text-[#52007C] dark:text-white text-sm font-medium"
                    >
                      {project.name} ({t('projectManager.employeeAssign.id')}: {project.id})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[#7A00B8] dark:text-[#D68BF9]">
              {t('projectManager.cards.noProjectsAssigned')}
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default EmployeeCard;