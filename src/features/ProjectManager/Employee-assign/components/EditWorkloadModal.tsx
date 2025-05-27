// Path: src/features/ProjectManager/Employee-assign/components/EditWorkloadModal.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaEdit, FaCheck, FaTimes, FaUser, FaPercentage, FaInfoCircle } from 'react-icons/fa';

interface EditWorkloadModalProps {
  isOpen: boolean;
  assignment: {
    id: number;
    employeeName: string;
    projectName: string;
    role: string;
    workloadPercentage: number;
    employeeId: string; // Added to get employee data
  } | null;
  onClose: () => void;
  onConfirm: (id: number, role: string, workloadPercentage: number) => void;
  availableRoles: string[];
  employees: any[]; // Added to get current employee workload
  error?: string;
}

const EditWorkloadModal: React.FC<EditWorkloadModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onConfirm,
  availableRoles,
  employees,
  error
}) => {
  const [role, setRole] = useState(assignment?.role || '');
  const [workloadPercentage, setWorkloadPercentage] = useState(assignment?.workloadPercentage || 0);

  // Reset form when assignment changes
  React.useEffect(() => {
    if (assignment) {
      setRole(assignment.role);
      setWorkloadPercentage(assignment.workloadPercentage);
    }
  }, [assignment]);

  // Calculate employee workload information
  const employeeWorkloadInfo = useMemo(() => {
    if (!assignment || !employees.length) return null;

    const employee = employees.find(emp => emp.id === assignment.employeeId);
    if (!employee) return null;

    const currentTotalWorkload = employee.currentWorkloadPercentage;
    const currentAssignmentWorkload = assignment.workloadPercentage;
    const workloadWithoutThisAssignment = currentTotalWorkload - currentAssignmentWorkload;
    const availableWorkload = 100 - workloadWithoutThisAssignment;
    const newTotalWorkload = workloadWithoutThisAssignment + workloadPercentage;
    const remainingAfterChange = 100 - newTotalWorkload;

    return {
      currentTotal: currentTotalWorkload,
      currentAssignment: currentAssignmentWorkload,
      withoutThisAssignment: workloadWithoutThisAssignment,
      available: availableWorkload,
      newTotal: newTotalWorkload,
      remainingAfterChange: remainingAfterChange,
      isOverAllocated: newTotalWorkload > 100,
      employee: employee
    };
  }, [assignment, employees, workloadPercentage]);

  const handleConfirm = useCallback(() => {
    if (assignment && role && workloadPercentage > 0 && workloadPercentage <= 100 && !employeeWorkloadInfo?.isOverAllocated) {
      onConfirm(assignment.id, role, workloadPercentage);
    }
  }, [assignment, role, workloadPercentage, onConfirm, employeeWorkloadInfo?.isOverAllocated]);

  if (!isOpen || !assignment) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-[#F6E6FF] min-w-[600px] max-w-[90vw]">
        <div className="flex items-center gap-2 mb-4">
          <FaEdit className="text-[#BF4BF6]" />
          <h3 className="text-lg font-semibold text-[#52007C]">Edit Assignment</h3>
        </div>
        
        <div className="space-y-4">
          {/* Assignment Info */}
          <div className="p-4 bg-[#F6E6FF] rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#7A00B8]">
                  <strong>Employee:</strong> {assignment.employeeName}
                </p>
                <p className="text-sm text-[#7A00B8]">
                  <strong>Project:</strong> {assignment.projectName}
                </p>
              </div>
              {employeeWorkloadInfo && (
                <div>
                  <p className="text-sm text-[#7A00B8]">
                    <strong>Current Total Workload:</strong> {employeeWorkloadInfo.currentTotal}%
                  </p>
                  <p className="text-sm text-[#7A00B8]">
                    <strong>This Assignment:</strong> {employeeWorkloadInfo.currentAssignment}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Workload Calculator */}
          {employeeWorkloadInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FaInfoCircle className="text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-800">Workload Calculator</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">
                    <strong>Without this assignment:</strong> {employeeWorkloadInfo.withoutThisAssignment}%
                  </p>
                  <p className="text-blue-700">
                    <strong>Available capacity:</strong> {employeeWorkloadInfo.available}%
                  </p>
                </div>
                <div>
                  <p className={`font-semibold ${employeeWorkloadInfo.isOverAllocated ? 'text-red-600' : 'text-green-600'}`}>
                    <strong>New total:</strong> {employeeWorkloadInfo.newTotal}%
                  </p>
                  <p className={`font-semibold ${employeeWorkloadInfo.remainingAfterChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <strong>Remaining after change:</strong> {employeeWorkloadInfo.remainingAfterChange}%
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Workload Distribution</span>
                  <span className={`font-semibold ${employeeWorkloadInfo.isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
                    {employeeWorkloadInfo.newTotal}% of 100%
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {/* Other assignments */}
                    <div
                      className="bg-gray-400"
                      style={{ width: `${Math.min(employeeWorkloadInfo.withoutThisAssignment, 100)}%` }}
                      title={`Other assignments: ${employeeWorkloadInfo.withoutThisAssignment}%`}
                    />
                    {/* This assignment */}
                    <div
                      className={`${employeeWorkloadInfo.isOverAllocated ? 'bg-red-500' : 'bg-[#BF4BF6]'}`}
                      style={{ 
                        width: `${Math.min(workloadPercentage, 100 - employeeWorkloadInfo.withoutThisAssignment)}%` 
                      }}
                      title={`This assignment: ${workloadPercentage}%`}
                    />
                    {/* Over-allocation indicator */}
                    {employeeWorkloadInfo.isOverAllocated && (
                      <div
                        className="bg-red-600 opacity-80 animate-pulse"
                        style={{ 
                          width: `${Math.min(employeeWorkloadInfo.newTotal - 100, 100)}%` 
                        }}
                        title={`Over-allocation: ${employeeWorkloadInfo.newTotal - 100}%`}
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(error || employeeWorkloadInfo?.isOverAllocated) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error || `Workload exceeds 100%! You can assign maximum ${employeeWorkloadInfo?.available}% to this employee.`}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-[#52007C] mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-[#F6E6FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6]"
            >
              <option value="">Select Role</option>
              {availableRoles.map(roleOption => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>

          {/* Workload Percentage Input */}
          <div>
            <label className="block text-sm font-medium text-[#52007C] mb-1">
              Workload Percentage
              {employeeWorkloadInfo && (
                <span className="text-xs text-gray-500 ml-2">
                  (Available: {employeeWorkloadInfo.available}%)
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={employeeWorkloadInfo?.available || 100}
                value={workloadPercentage}
                onChange={(e) => setWorkloadPercentage(parseInt(e.target.value) || 0)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] ${
                  employeeWorkloadInfo?.isOverAllocated 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-[#F6E6FF]'
                }`}
                placeholder={`Max: ${employeeWorkloadInfo?.available || 100}%`}
              />
              <span className="text-sm text-[#52007C] flex items-center gap-1">
                <FaPercentage className="w-3 h-3" />
                %
              </span>
            </div>
            {employeeWorkloadInfo && (
              <div className="mt-1 text-xs text-gray-600">
                Range: 1% - {employeeWorkloadInfo.available}% 
                {employeeWorkloadInfo.isOverAllocated && (
                  <span className="text-red-600 ml-2">⚠️ Exceeds available capacity</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#7A00B8] hover:text-[#52007C] transition-colors flex items-center gap-2"
          >
            <FaTimes size={14} />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !role || 
              workloadPercentage <= 0 || 
              workloadPercentage > 100 || 
              employeeWorkloadInfo?.isOverAllocated ||
              !employeeWorkloadInfo?.available ||
              workloadPercentage > employeeWorkloadInfo?.available
            }
            className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#52007C] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheck size={14} />
            Update Assignment
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditWorkloadModal;