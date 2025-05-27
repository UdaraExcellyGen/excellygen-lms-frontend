// Path: src/features/ProjectManager/Employee-assign/components/ProjectDetailsPopup.tsx

import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimesCircle, FaLaptopCode } from 'react-icons/fa';
import { Project, Employee } from '../types/types';

interface ProjectDetailsPopupProps {
  project: Project | null;
  onClose: () => void;
  darkMode: boolean;
  employees: Employee[];
}

const ProjectDetailsPopup: React.FC<ProjectDetailsPopupProps> = ({ project, onClose, darkMode, employees }) => {
    if (!project) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[99999]">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] dark:border-[#7A00B8] min-w-[700px] max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#52007C] dark:text-white">{project.name} Details</h3>
                    <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FaTimesCircle className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-[#7A00B8] dark:text-white">
                        <strong>Status:</strong> {project.status}
                    </p>
                    <p className="text-sm text-[#7A00B8] dark:text-white">
                        <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-[#7A00B8] dark:text-white">
                        <strong>Description:</strong> {project.description}
                    </p>
                    <div>
                        <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-1">
                            Required Technologies
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {project.requiredSkills.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-3 py-1 text-xs rounded-full bg-white
                                    text-[#52007C] dark:text-[#D68BF9] flex items-center gap-1"
                                >
                                    <FaLaptopCode className="w-3 h-3" />
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                     </div>
                    <div>
                        <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-2">
                            Required Roles
                        </h5>
                        {project.requiredRoles.map((roleItem, index) => (
                            <p key={index} className="text-sm text-[#7A00B8] dark:text-white">
                                {roleItem.roleName}: {roleItem.count}
                            </p>
                        ))}
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-[#52007C] dark:text-[#D68BF9] mb-2">
                            Assigned Team Members
                        </h5>
                        {/* Group assignments by employee for easier reading */}
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
                                <div key={employeeId} className="mb-2">
                                    <p className="text-sm font-medium text-[#7A00B8] dark:text-white">
                                        {employee.name} (ID: {employee.id}) - Total: {totalAllocation}% allocation
                                    </p>
                                    <ul className="pl-6 list-disc">
                                        {assignments.map((assignment, index) => (
                                            <li key={index} className="text-xs text-[#7A00B8] dark:text-[#D68BF9]">
                                                {assignment.role}: {assignment.workloadPercentage}% allocation
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProjectDetailsPopup;