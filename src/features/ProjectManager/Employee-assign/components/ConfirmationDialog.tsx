// Path: src/features/ProjectManager/Employee-assign/components/ConfirmationDialog.tsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, Employee } from '../types/types';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (employeeAssignments: Record<string, { role: string, workloadPercentage: number }>) => void;
  selectedEmployees: string[];
  selectedProject: Project | null;
  employees: Employee[];
  projectRoles: string[];
  assignmentError: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedEmployees,
  selectedProject,
  employees,
  projectRoles,
  assignmentError
}) => {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const selectedEmployeeData = selectedEmployees.map(empId => employees.find(emp => emp.id === empId)).filter(Boolean) as Employee[];
  const [employeeAssignments, setEmployeeAssignments] = useState<Record<string, { role: string, workloadPercentage: number }>>({});
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);

  useEffect(() => {
      const initialAssignments = {} as Record<string, { role: string, workloadPercentage: number }>;
      selectedEmployees.forEach(empId => {
          const employee = employees.find(e => e.id === empId);
          const availableWorkload = employee ? employee.availableWorkloadPercentage : 100;
          initialAssignments[empId] = { 
              role: "", 
              workloadPercentage: Math.min(100, availableWorkload) 
          };
      });
      setEmployeeAssignments(initialAssignments);
  }, [isOpen, selectedEmployees, employees]);

  useEffect(() => {
      const allRolesSelected = selectedEmployees.every(empId => 
          employeeAssignments[empId]?.role && 
          employeeAssignments[empId]?.workloadPercentage > 0 && 
          employeeAssignments[empId]?.workloadPercentage <= 100
      );
      setIsConfirmDisabled(!allRolesSelected);
  }, [employeeAssignments, selectedEmployees]);

  // ✅ NOW conditional logic can happen AFTER all hooks
  if (!isOpen) return null;

  const handleRoleChange = (employeeId: string, role: string) => {
      setEmployeeAssignments(prev => ({
          ...prev,
          [employeeId]: { 
              ...prev[employeeId],
              role 
          },
      }));
  };
  
  const handleWorkloadChange = (employeeId: string, percentage: number) => {
      setEmployeeAssignments(prev => ({
          ...prev,
          [employeeId]: { 
              ...prev[employeeId],
              workloadPercentage: percentage 
          },
      }));
  };

  const handleConfirmRoles = () => {
      if (isConfirmDisabled) {
          return;
      }
      onConfirm(employeeAssignments);
  };

  return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] dark:border-[#7A00B8] min-w-[700px]">
              <h3 className="text-lg font-semibold text-[#52007C] dark:text-white mb-4">Confirm Employee Assignment?</h3>
              <p className="text-[#7A00B8] dark:text-white mb-4">Please confirm assigning the following employees to the project and select their roles:</p>

              {assignmentError && <p className="text-red-500 text-sm mb-2">{assignmentError}</p>}

              <div className="overflow-x-auto mb-4">
                  <table className="min-w-full">
                      <thead className="bg-white">
                          <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-[#52007C] dark:text-white">Employee Name</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-[#52007C] dark:text-white">Employee ID</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-[#52007C] dark:text-white">Role</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-[#52007C] dark:text-white">Workload %</th>
                          </tr>
                      </thead>
                      <tbody>
                          {selectedEmployeeData.map(employee => (
                              <tr key={employee.id} className="border-b border-[#F6E6FF] dark:border-[#7A00B8]">
                                  <td className="px-4 py-2 text-sm text-[#52007C] dark:text-white">{employee.name}</td>
                                  <td className="px-4 py-2 text-sm text-[#52007C] dark:text-white">{employee.id}</td>
                                  <td className="px-4 py-2">
                                      <select
                                          value={employeeAssignments[employee.id]?.role || ""}
                                          onChange={(e) => handleRoleChange(employee.id, e.target.value)}
                                          className="w-full px-2 py-1 rounded-lg border border-[#F6E6FF] dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F] text-[#52007C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] text-sm"
                                          required
                                      >
                                          <option value="">Select Role</option>
                                          {projectRoles.map(role => (
                                              <option key={role} value={role}>{role}</option>
                                          ))}
                                      </select>
                                  </td>
                                  <td className="px-4 py-2">
                                      <div className="flex items-center gap-2">
                                          <input
                                              type="number"
                                              min="1"
                                              max={employee.availableWorkloadPercentage}
                                              value={employeeAssignments[employee.id]?.workloadPercentage || 0}
                                              onChange={(e) => handleWorkloadChange(employee.id, parseInt(e.target.value) || 0)}
                                              className={`w-20 px-2 py-1 rounded-lg border border-[#F6E6FF] dark:border-[#7A00B8] 
                                                bg-white dark:bg-[#1B0A3F] text-[#52007C] dark:text-white 
                                                focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] text-sm`}
                                              required
                                              disabled={employee.availableWorkloadPercentage <= 0}
                                          />
                                          <span className="text-sm text-[#52007C] dark:text-white">%</span>
                                          
                                          {employee.availableWorkloadPercentage > 0 ? (
                                            <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
                                              Available: {employee.availableWorkloadPercentage}%
                                            </span>
                                          ) : (
                                            <span className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded-full">
                                              Fully allocated
                                            </span>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              {selectedProject && (
                  <div className="mb-4 p-4 rounded-lg bg-white">
                      <h4 className="text-md font-semibold text-[#52007C] dark:text-white mb-2">Project Details</h4>
                      <p className="text-sm text-[#7A00B8] dark:text-white">
                          Project Name: <span className="font-medium text-[#52007C] dark:text-white">{selectedProject.name}</span>
                          <br />
                          Project ID: <span className="font-medium text-[#52007C] dark:text-white">{selectedProject.id}</span>
                      </p>
                  </div>
              )}

              <div className="flex justify-end gap-4">
                  <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                  <button
                      onClick={handleConfirmRoles}
                      disabled={isConfirmDisabled}
                      className={`px-4 py-2 bg-[#52007C] text-white rounded-lg font-medium hover:bg-[#7A00B8] transition-colors ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      Confirm Assignment
                  </button>
              </div>
          </div>
      </div>,
      document.body
  );
};

export default ConfirmationDialog;