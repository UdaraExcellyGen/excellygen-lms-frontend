// Path: src/features/ProjectManager/Employee-assign/Employee-assign.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FaUserCircle, FaProjectDiagram, FaSearch, FaArrowLeft,
    FaObjectGroup, FaChevronDown, FaChevronLeft, FaChevronRight,
    FaUserSlash, FaHashtag, FaExclamationTriangle, FaSpinner, FaBullseye, FaThumbtack
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Import components
import MultiSelect from './components/MultiSelect';
import ProjectDetailsPopup from './components/ProjectDetailsPopup';
import DuplicateAssignmentDialog from './components/DuplicateAssignmentDialog';
import RemoveEmployeeConfirmationDialog from './components/RemoveEmployeeConfirmationDialog';
import BottomBarWithAvatars from './components/BottomBarWithAvatars';
import ConfirmationDialog from './components/ConfirmationDialog';
import EmployeeCard from './components/EmployeeCard';
import ProjectCard from './components/ProjectCard';
import EditWorkloadModal from './components/EditWorkloadModal';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher';

// Import types and API services
import { Employee, Project, EmployeeFilter } from './types/types';
import { employeeApi, projectApi, assignmentApi, resourceApi, PaginatedResponse } from '../../../api/services/ProjectManager/employeeAssignmentService';

// Custom hook for debounced search
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const EmployeeManagement: React.FC = () => {
    const { t } = useTranslation();
    const [darkMode] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState('All');
    
    // Search states with debouncing
    const [searchTerm, setSearchTerm] = useState('');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const debouncedProjectSearchTerm = useDebounce(projectSearchTerm, 300);
    
    const [skillFilter, setSkillFilter] = useState<string[]>([]);
    const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [isSkillMatchActive, setIsSkillMatchActive] = useState(false);
    const [searchType, setSearchType] = useState('name');
    const [projectSearchType, setProjectSearchType] = useState('name');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(50);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Data states
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeePagination, setEmployeePagination] = useState<PaginatedResponse<Employee> | null>(null);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [availableSkills, setAvailableSkills] = useState<string[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState({
        projects: false,
        employees: false,
        roles: false,
        skills: false,
        pagination: false
    });

    // Dialog states
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [projectDetailsPopup, setProjectDetailsPopup] = useState({ isOpen: false, project: null as Project | null });
    const [isDuplicateAssignmentOpen, setIsDuplicateAssignmentOpen] = useState(false);
    const [duplicateEmployees, setDuplicateEmployees] = useState<Employee[]>([]);
    const [showEmployeesWithoutProjects, setShowEmployeesWithoutProjects] = useState(false);
    const [assignmentError, setAssignmentError] = useState('');
    const [isRemoveConfirmationOpen, setIsRemoveConfirmationOpen] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null);
    const [projectToRemoveFrom, setProjectToRemoveFrom] = useState<Project | null>(null);
    const [showWarningMessage, setShowWarningMessage] = useState(false);

    // Edit assignment modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<{
        id: number;
        employeeName: string;
        projectName: string;
        role: string;
        workloadPercentage: number;
        employeeId: string;
    } | null>(null);
    const [editAssignmentError, setEditAssignmentError] = useState('');

    const multiSelectButtonRef = useRef<HTMLButtonButton>(null);

    // Memoized filter object to prevent unnecessary re-renders
    const employeeFilter = useMemo<EmployeeFilter>(() => ({
        searchTerm: debouncedSearchTerm || undefined,
        availableOnly: showEmployeesWithoutProjects || undefined,
        skills: skillFilter.length > 0 ? skillFilter : undefined
    }), [debouncedSearchTerm, showEmployeesWithoutProjects, skillFilter]);

    // ✅ NEW: Calculate filtered skills for MultiSelect dropdown
    const filteredSkillsForDropdown = useMemo(() => {
        if (isSkillMatchActive && selectedProject && selectedProject.requiredSkills.length > 0) {
            // When match technologies is active, show only project's required technologies
            return selectedProject.requiredSkills.map(skill => skill.name);
        } else {
            // When match technologies is NOT active, show all available skills
            return availableSkills;
        }
    }, [isSkillMatchActive, selectedProject, availableSkills]);

    // Initialize data on component mount
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load projects when status filter changes
    useEffect(() => {
        loadProjects();
    }, [projectStatusFilter]);

    // Load employees when filters change (debounced)
    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
        loadEmployees(1);
    }, [employeeFilter, isSkillMatchActive, selectedProject]);

    // Load employees when page changes
    useEffect(() => {
        if (currentPage > 1) {
            loadEmployees(currentPage);
        }
    }, [currentPage]);

    // Handle click outside for status dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [statusDropdownRef]);

    // Show warning message when no project is selected
    useEffect(() => {
        if (showWarningMessage) {
            const timer = setTimeout(() => {
                setShowWarningMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showWarningMessage]);

    // ✅ NEW: Clear skill filter when match technologies or project changes
    useEffect(() => {
        // Clear skill filter when switching projects or toggling match technologies
        setSkillFilter([]);
    }, [isSkillMatchActive, selectedProject?.id]);

    // API Loading Functions
    const loadInitialData = async () => {
        try {
            await Promise.all([
                loadProjects(),
                loadRoles(),
                loadSkills()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Failed to load initial data');
        }
    };

    const loadProjects = async () => {
        setIsLoading(prev => ({ ...prev, projects: true }));
        try {
            const statusFilter = projectStatusFilter !== 'All' ? projectStatusFilter : undefined;
            const projectsData = await projectApi.getAllProjects(statusFilter);

            // Load assignments for each project
            const projectsWithAssignments = await Promise.all(
                projectsData.map(async (project) => {
                    try {
                        const assignments = await projectApi.getProjectAssignments(project.id);
                        return { ...project, employeeAssignments: assignments };
                    } catch (error) {
                        console.error(`Error loading assignments for project ${project.id}:`, error);
                        return { ...project, employeeAssignments: [] };
                    }
                })
            );

            setProjects(projectsWithAssignments);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(prev => ({ ...prev, projects: false }));
        }
    };

    const loadEmployees = useCallback(async (page: number = 1) => {
        const loadingKey = page === 1 ? 'employees' : 'pagination';
        setIsLoading(prev => ({ ...prev, [loadingKey]: true }));
        
        try {
            let result: PaginatedResponse<Employee>;

            if (isSkillMatchActive && selectedProject) {
                // ✅ IMPROVED: Get employees matching project skills with case-insensitive matching
                const projectSkills = selectedProject.requiredSkills.map(skill => skill.name);
                console.log('🔍 Filtering employees by project skills:', projectSkills);
                
                if (projectSkills.length > 0) {
                    // If additional skill filter is applied, combine with project skills
                    let skillsToMatch = projectSkills;
                    
                    if (skillFilter.length > 0) {
                        // Find intersection of project skills and selected skill filter
                        const lowerProjectSkills = projectSkills.map(s => s.toLowerCase());
                        const lowerSkillFilter = skillFilter.map(s => s.toLowerCase());
                        
                        // Only use skills that are both in project AND in selected filter
                        skillsToMatch = projectSkills.filter(projectSkill => 
                            lowerSkillFilter.includes(projectSkill.toLowerCase())
                        );
                        
                        console.log('🎯 Combined skills filter (project + selected):', skillsToMatch);
                    }
                    
                    if (skillsToMatch.length > 0) {
                        result = await employeeApi.getEmployeesBySkills(skillsToMatch, page, pageSize);
                    } else {
                        // No matching skills, return empty result
                        result = {
                            data: [],
                            pagination: {
                                currentPage: 1,
                                pageSize: pageSize,
                                totalCount: 0,
                                totalPages: 0,
                                hasNextPage: false,
                                hasPreviousPage: false
                            }
                        };
                    }
                } else {
                    result = await employeeApi.getAvailableEmployees(employeeFilter, page, pageSize);
                }
            } else {
                result = await employeeApi.getAvailableEmployees(employeeFilter, page, pageSize);
            }

            // ✅ IMPROVED: Additional client-side filtering for better matching
            if (isSkillMatchActive && selectedProject && result.data.length > 0) {
                const projectSkills = selectedProject.requiredSkills.map(skill => skill.name.toLowerCase());
                
                // Filter employees to ensure they have at least one matching skill (case-insensitive)
                const filteredEmployees = result.data.filter(employee => {
                    const employeeSkills = employee.skills.map(skill => skill.toLowerCase());
                    return projectSkills.some(projectSkill => 
                        employeeSkills.some(empSkill => empSkill.includes(projectSkill) || projectSkill.includes(empSkill))
                    );
                });
                
                result.data = filteredEmployees;
                result.pagination.totalCount = filteredEmployees.length;
                
                console.log(`✅ Filtered ${filteredEmployees.length} employees with matching skills`);
            }

            // Update employees list based on whether we're loading a new page or replacing
            if (page === 1) {
                setEmployees(result.data);
            } else {
                // For pagination, we replace the current data
                setEmployees(result.data);
            }

            setEmployeePagination(result);
            setCurrentPage(result.pagination.currentPage);
            setTotalPages(result.pagination.totalPages);
            setTotalCount(result.pagination.totalCount);

        } catch (error) {
            console.error('Error loading employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setIsLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    }, [employeeFilter, isSkillMatchActive, selectedProject, pageSize, skillFilter]);

    const loadRoles = async () => {
        setIsLoading(prev => ({ ...prev, roles: true }));
        try {
            const rolesData = await resourceApi.getAllRoles();
            setAvailableRoles(rolesData.map((role: any) => role.name));
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setIsLoading(prev => ({ ...prev, roles: false }));
        }
    };

    const loadSkills = async () => {
        setIsLoading(prev => ({ ...prev, skills: true }));
        try {
            const skillsData = await resourceApi.getAllTechnologies();
            setAvailableSkills(skillsData.map((tech: any) => tech.name));
        } catch (error) {
            console.error('Error loading skills:', error);
            toast.error('Failed to load skills');
        } finally {
            setIsLoading(prev => ({ ...prev, skills: false }));
        }
    };

    // Event Handlers
    const handleEmployeeSelect = (employeeId: string) => {
        if (!selectedProject) {
            setShowWarningMessage(true);
            return;
        }

        setSelectedEmployees(prev =>
            prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
        );
    };

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(prevProject => (prevProject?.id === project.id ? null : project));
        setIsSkillMatchActive(false);
        setSelectedEmployees([]);
        setSkillFilter([]); // ✅ Clear skill filter when changing projects
    };

    const toggleProjectExpansion = (projectId: string) => {
        setExpandedProjects(prev =>
            prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
        );
    };

    const handleAssignEmployees = () => {
        if (!selectedProject || selectedEmployees.length === 0) return;
        setIsConfirmationOpen(true);
        setAssignmentError('');
    };

    const confirmAssignment = async (employeeAssignments: Record<string, { role: string, workloadPercentage: number }>) => {
        if (!selectedProject || selectedEmployees.length === 0) return;

        const rolesNotSelected = selectedEmployees.filter(empId => !employeeAssignments[empId]?.role);
        if (rolesNotSelected.length > 0) {
            setAssignmentError('Please select a role for each employee.');
            return;
        }

        const invalidWorkloads = selectedEmployees.filter(empId => {
            const assignment = employeeAssignments[empId];
            if (!assignment?.workloadPercentage || assignment.workloadPercentage <= 0) return true;

            const employee = employees.find(e => e.id === empId);
            const requestedWorkload = assignment.workloadPercentage;

            return employee && employee.currentWorkloadPercentage + requestedWorkload > 100;
        });

        if (invalidWorkloads.length > 0) {
            const overAllocatedEmployees = invalidWorkloads.map(empId => {
                const employee = employees.find(e => e.id === empId);
                return employee?.name;
            }).filter(Boolean).join(", ");

            setAssignmentError(`Invalid workload allocation for: ${overAllocatedEmployees}. Employee workload cannot exceed 100%.`);
            return;
        }

        setAssignmentError('');

        try {
            const assignments = selectedEmployees.map(empId => ({
                employeeId: empId,
                role: employeeAssignments[empId].role,
                workloadPercentage: employeeAssignments[empId].workloadPercentage
            }));

            await assignmentApi.bulkAssignEmployeesToProject({
                projectId: selectedProject.id,
                assignments
            });

            toast.success('Employees assigned successfully!');

            // Refresh data
            await Promise.all([loadProjects(), loadEmployees(currentPage)]);

            setIsConfirmationOpen(false);
            setSelectedEmployees([]);
            setSelectedProject(null);
            setIsSkillMatchActive(false);
        } catch (error: any) {
            console.error('Error assigning employees:', error);
            if (error.response?.data?.message?.includes('already assigned')) {
                const duplicateEmps = selectedEmployees.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[];
                setDuplicateEmployees(duplicateEmps);
                setIsDuplicateAssignmentOpen(true);
            } else {
                setAssignmentError(error.response?.data?.message || 'Error assigning employees');
                toast.error('Failed to assign employees');
            }
        }
    };

    const cancelAssignmentConfirmation = () => {
        setIsConfirmationOpen(false);
        setAssignmentError('');
    };

    const cancelDuplicateAssignmentWarning = () => {
        setIsDuplicateAssignmentOpen(false);
        setDuplicateEmployees([]);
    };

    const handleRemoveFromProject = async (projectId: string, employeeId: string) => {
        try {
            await assignmentApi.removeEmployeeFromProject(projectId, employeeId);
            toast.success('Employee removed from project successfully!');

            // Refresh data
            await Promise.all([loadProjects(), loadEmployees(currentPage)]);
        } catch (error) {
            console.error('Error removing employee from project:', error);
            toast.error('Failed to remove employee from project');
        }
    };

    const confirmRemoveEmployee = () => {
        if (employeeToRemove && projectToRemoveFrom) {
            handleRemoveFromProject(projectToRemoveFrom.id, employeeToRemove.id);
        }
        setIsRemoveConfirmationOpen(false);
        setEmployeeToRemove(null);
        setProjectToRemoveFrom(null);
    };

    const cancelRemoveEmployee = () => {
        setIsRemoveConfirmationOpen(false);
        setEmployeeToRemove(null);
        setProjectToRemoveFrom(null);
    };

    const triggerRemoveConfirmation = (projectId: string, employeeId: string) => {
        const employeeData = employees.find(e => e.id === employeeId);
        const projectData = projects.find(p => p.id === projectId);
        if (employeeData && projectData) {
            setEmployeeToRemove(employeeData);
            setProjectToRemoveFrom(projectData);
            setIsRemoveConfirmationOpen(true);
        }
    };

    // ✅ IMPROVED: Enhanced skill match handler
    const handleSkillMatch = () => {
        if (!selectedProject) {
            toast.error('Please select a project first');
            return;
        }
        
        const newSkillMatchState = !isSkillMatchActive;
        setIsSkillMatchActive(newSkillMatchState);
        
        if (newSkillMatchState) {
            console.log('🎯 Skill matching activated for project:', selectedProject.name);
            console.log('📋 Project required skills:', selectedProject.requiredSkills.map(s => s.name));
            toast.success(`Filtering employees by ${selectedProject.name} technologies`);
        } else {
            console.log('🔄 Skill matching deactivated');
            toast.info('Showing all employees');
        }
        
        // Reset pagination when toggling skill match
        setCurrentPage(1);
    };

    const handleOpenProjectDetails = (project: Project) => {
        setProjectDetailsPopup({ isOpen: true, project: project });
    };

    const handleCloseProjectDetails = () => {
        setProjectDetailsPopup({ isOpen: false, project: null });
    };

    const clearSelections = () => {
        setSelectedEmployees([]);
        setSelectedProject(null);
        setIsSkillMatchActive(false);
        setShowEmployeesWithoutProjects(false);
        setSkillFilter([]); // ✅ Also clear skill filter
    };

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && !isLoading.pagination) {
            setCurrentPage(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Edit assignment handlers
    const triggerEditAssignment = (assignment: {
        id: number;
        employeeName: string;
        projectName: string;
        role: string;
        workloadPercentage: number;
        employeeId: string;
    }) => {
        setSelectedAssignment(assignment);
        setEditAssignmentError('');
        setIsEditModalOpen(true);
    };

    const handleEditAssignmentClose = () => {
        setIsEditModalOpen(false);
        setSelectedAssignment(null);
        setEditAssignmentError('');
    };

    const handleEditAssignmentConfirm = async (assignmentId: number, role: string, workloadPercentage: number) => {
        try {
            await assignmentApi.updateEmployeeAssignment(assignmentId, { role, workloadPercentage });
            toast.success('Assignment updated successfully!');

            // Refresh data
            await Promise.all([loadProjects(), loadEmployees(currentPage)]);

            setIsEditModalOpen(false);
            setSelectedAssignment(null);
            setEditAssignmentError('');
        } catch (error: any) {
            console.error('Error updating assignment:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update assignment';
            setEditAssignmentError(errorMessage);
            toast.error('Failed to update assignment');
        }
    };

    // Filter projects based on search
    const filteredProjects = projects.filter(project => {
        const searchLower = debouncedProjectSearchTerm.toLowerCase();
        if (projectSearchType === 'name') {
            return project.name.toLowerCase().includes(searchLower);
        } else if (projectSearchType === 'id') {
            return project.id.toLowerCase().includes(searchLower);
        }
        return true;
    });

    // Filter employees based on search (client-side for current page)
    const filteredEmployees = employees.filter(employee => {
        const searchLower = debouncedSearchTerm.toLowerCase();
        if (searchType === 'name') {
            return employee.name.toLowerCase().includes(searchLower) ||
                   employee.role.toLowerCase().includes(searchLower);
        } else {
            return employee.id.toLowerCase().includes(searchLower);
        }
    });

    const scrollbarStyles = {
        overflowY: 'auto' as const,
        maxHeight: '600px',
        paddingRight: '1rem'
    };

    // Pagination component
    const PaginationControls = () => (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-700">
                <span>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} employees
                </span>
            </div>
            
            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1 || isLoading.pagination}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                disabled={isLoading.pagination}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === page
                                        ? 'z-10 bg-[#52007C] border-[#52007C] text-white'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>
                
                <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || isLoading.pagination}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronRight className="h-4 w-4" />
                </button>
                
                {isLoading.pagination && (
                    <FaSpinner className="animate-spin h-4 w-4 text-[#52007C] ml-2" />
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#52007C] p-2 sm:p-4 lg:p-6 xl:p-8">
            <div className="max-w-full mx-auto">
                <header className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 mb-4 lg:mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center justify-start">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                to="/project-manager/dashboard"
                                className="p-2 rounded-lg hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F]
                                    text-[#52007C] dark:text-[#D68BF9] transition-colors"
                            >
                                <FaArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                            </Link>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                {t('projectManager.employeeAssign.title')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2 w-full lg:w-auto">
                        <LanguageSwitcher />
                        {/* ✅ UPDATED: Pass filtered skills to MultiSelect */}
                        <MultiSelect
                            value={skillFilter}
                            onChange={setSkillFilter}
                            options={filteredSkillsForDropdown}
                            darkMode={darkMode}
                            buttonRef={multiSelectButtonRef}
                        />
                        <button
                            onClick={handleSkillMatch}
                            disabled={!selectedProject}
                            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap
                                ${isSkillMatchActive && selectedProject
                                    ? 'bg-[#52007C] text-white shadow-lg'
                                    : selectedProject
                                        ? 'bg-[#D68BF9] dark:bg-[#BF4BF6] text-white hover:bg-[#BF4BF6] dark:hover:bg-[#D68BF9]'
                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] opacity-50 cursor-not-allowed'
                                }`}
                            title={`${isSkillMatchActive ? 'Disable' : 'Enable'} filtering employees by project's required technologies.`}
                        >
                            {isSkillMatchActive ? (
                                <>
                                    <FaBullseye className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Matched Skills</span>
                                    <span className="sm:hidden">Match</span>
                                </>
                            ) : (
                                <>
                                    <FaObjectGroup className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{t('projectManager.employeeAssign.matchTechnologies')}</span>
                                    <span className="sm:hidden">Match</span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 h-full">
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 h-full flex flex-col">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 lg:mb-6 gap-4">
                                <h2 className="text-lg sm:text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    {t('projectManager.employeeAssign.projects')} ({filteredProjects.length})
                                </h2>
                                <div className="flex-1 max-w-full lg:max-w-sm">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8] w-3 h-3 sm:w-4 sm:h-4" />
                                        <input
                                            type="text"
                                            placeholder={t('projectManager.employeeAssign.searchProjects')}
                                            value={projectSearchTerm}
                                            onChange={(e) => setProjectSearchTerm(e.target.value)}
                                            className="w-full pl-8 sm:pl-10 pr-20 sm:pr-24 py-2 text-sm rounded-lg border border-[#F6E6FF]
                                                dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F]
                                                text-[#52007C] dark:text-white focus:outline-none
                                                focus:ring-2 focus:ring-[#BF4BF6]"
                                        />
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                            <button
                                                onClick={() => setProjectSearchType('name')}
                                                className={`px-2 sm:px-3 py-1 rounded-l-md flex items-center gap-1 text-xs ${projectSearchType === 'name'
                                                        ? 'bg-[#BF4BF6] text-white'
                                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                    }`}
                                                title={t('projectManager.employeeAssign.searchByName')}
                                            >
                                                <FaProjectDiagram className="w-3 h-3" /> <span className="hidden sm:inline">{t('projectManager.employeeAssign.name')}</span>
                                            </button>
                                            <button
                                                onClick={() => setProjectSearchType('id')}
                                                className={`px-2 sm:px-3 py-1 rounded-r-md flex items-center gap-1 text-xs ${projectSearchType === 'id'
                                                        ? 'bg-[#BF4BF6] text-white'
                                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                    }`}
                                                title={t('projectManager.employeeAssign.searchById')}
                                            >
                                                <FaHashtag className="w-3 h-3" /> <span className="hidden sm:inline">{t('projectManager.employeeAssign.id')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:gap-4 w-full lg:w-auto">
                                    <div ref={statusDropdownRef} className="relative flex-1 lg:flex-initial">
                                        <button
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                            className="inline-flex justify-center w-full rounded-lg border border-[#F6E6FF]
                                                dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F] px-3 sm:px-4 py-2 text-xs sm:text-sm
                                                font-medium text-[#52007C] dark:text-white hover:bg-[#F6E6FF]
                                                dark:hover:bg-[#34137C] focus:outline-none focus:ring-2
                                                focus:ring-[#BF4BF6] whitespace-nowrap"
                                        >
                                            <span className="truncate">
                                                {projectStatusFilter === 'All' ? t('projectManager.employeeAssign.allStatuses') : 
                                                 projectStatusFilter === 'Active' ? t('projectManager.employeeAssign.activeStatuses') : 
                                                 t('projectManager.employeeAssign.completedStatuses')}
                                            </span>
                                            <FaChevronDown className="-mr-1 ml-2 h-3 w-3 sm:h-5 sm:w-5" />
                                        </button>

                                        {isStatusDropdownOpen && (
                                            <div
                                                className="origin-top-right absolute right-0 mt-2 w-40 rounded-md
                                                    shadow-lg bg-white dark:bg-[#34137C] ring-1 ring-black
                                                    ring-opacity-5 focus:outline-none z-10"
                                            >
                                                <div className="py-1">
                                                    {['All', 'Active', 'Completed'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                setProjectStatusFilter(status);
                                                                setIsStatusDropdownOpen(false);
                                                            }}
                                                            className={`block w-full text-left px-4 py-2 text-sm ${projectStatusFilter === status ? 'font-bold bg-[#BF4BF6] text-white' : 'text-[#52007C] dark:text-white hover:bg-[#F6E6FF] dark:hover:bg-[#52007C]'}`}
                                                        >
                                                            {status === 'All' ? t('projectManager.employeeAssign.allStatuses') : 
                                                             status === 'Active' ? t('projectManager.employeeAssign.activeStatuses') : 
                                                             t('projectManager.employeeAssign.completedStatuses')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={scrollbarStyles} className="space-y-6 pr-2 h-full custom-scrollbar">
                                {isLoading.projects ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF4BF6]"></div>
                                    </div>
                                ) : filteredProjects.length === 0 ? (
                                    <div className="text-center py-8 text-[#7A00B8] dark:text-[#D68BF9] italic">
                                        {t('projectManager.employeeAssign.noProjectsFound')}
                                    </div>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            isSelected={selectedProject?.id === project.id}
                                            isExpanded={expandedProjects.includes(project.id)}
                                            employees={employees}
                                            handleProjectSelect={handleProjectSelect}
                                            toggleProjectExpansion={toggleProjectExpansion}
                                            triggerRemoveConfirmation={triggerRemoveConfirmation}
                                            triggerEditAssignment={triggerEditAssignment}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 h-full flex flex-col">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
                                <h2 className="text-lg sm:text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    {isSkillMatchActive && selectedProject
                                        ? t('projectManager.employeeAssign.matchedEmployees')
                                        : t('projectManager.employeeAssign.availableEmployees')}{' '}
                                    ({totalCount})
                                </h2>
                                <div className="flex-1 max-w-full lg:max-w-sm">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8] w-3 h-3 sm:w-4 sm:h-4" />
                                        <input
                                            type="text"
                                            placeholder={t('projectManager.employeeAssign.searchEmployees')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 text-sm rounded-lg border border-[#F6E6FF]
                                                dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F]
                                                text-[#52007C] dark:text-white focus:outline-none
                                                focus:ring-2 focus:ring-[#BF4BF6]"
                                        />
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                            <button
                                                onClick={() => setSearchType('name')}
                                                className={`px-2 sm:px-3 py-1 rounded-l-md flex items-center gap-1 text-xs ${searchType === 'name'
                                                        ? 'bg-[#BF4BF6] text-white'
                                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                    }`}
                                                title="Search by employee name or role"
                                            >
                                                <FaUserCircle className="w-3 h-3" /> <span className="hidden sm:inline">Name</span>
                                            </button>
                                            <button
                                                onClick={() => setSearchType('id')}
                                                className={`px-2 sm:px-3 py-1 rounded-r-md flex items-center gap-1 text-xs ${searchType === 'id'
                                                        ? 'bg-[#BF4BF6] text-white'
                                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                    }`}
                                                title="Search by employee ID"
                                            >
                                                <FaHashtag className="w-3 h-3" /> <span className="hidden sm:inline">ID</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEmployeesWithoutProjects(!showEmployeesWithoutProjects)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap
                                        ${showEmployeesWithoutProjects
                                            ? 'bg-[#52007C] text-white'
                                            : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#D68BF9] dark:hover:bg-[#34137C]'
                                        }`}
                                    title="Show employees without assigned projects"
                                >
                                    <FaUserSlash className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{t('projectManager.employeeAssign.freeBench')}</span>
                                    <span className="sm:hidden">Free</span>
                                </button>
                            </div>

                            {/* ✅ NEW: Show skill matching status */}
                            {isSkillMatchActive && selectedProject && (
                                <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">
                                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <span className="flex items-center gap-2">
                                            <FaBullseye className="w-3 h-3 sm:w-4 sm:h-4 text-[#BF4BF6] flex-shrink-0" />
                                            <strong>Skill Matching Active:</strong>
                                        </span>
                                        <span className="flex flex-wrap items-center gap-1">
                                            Showing employees with skills: {' '}
                                            <span className="font-mono text-xs bg-purple-100 px-2 py-1 rounded break-all">
                                                {selectedProject.requiredSkills.map(s => s.name).join(', ')}
                                            </span>
                                        </span>
                                    </p>
                                    {skillFilter.length > 0 && (
                                        <p className="text-xs mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-1">
                                            <span className="flex items-center gap-1">
                                                <FaThumbtack className="w-3 h-3 text-[#BF4BF6] flex-shrink-0" />
                                                Further filtered by:
                                            </span>
                                            <strong className="break-all">{skillFilter.join(', ')}</strong>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Warning message if no project is selected */}
                            {showWarningMessage && (
                                <div className="mb-4 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 transition-all duration-300 transform ease-in-out">
                                    <p className="text-sm flex items-center gap-2">
                                    <FaExclamationTriangle className="h-5 w-5" />
                                        {t('projectManager.employeeAssign.selectProjectFirst')}
                                    </p>
                                </div>
                            )}

                            {!selectedProject && (
                                <div className="mb-4 p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600">
                                    <p className="text-sm flex items-center gap-2">
                                        <FaProjectDiagram className="h-5 w-5" />
                                        {t('projectManager.employeeAssign.selectProjectFromLeft')}
                                    </p>
                                </div>
                            )}

                            <div style={scrollbarStyles} className="space-y-4 pr-2 h-full custom-scrollbar">
                                {isLoading.employees ? (
                                    <div className="flex justify-center items-center h-32">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF4BF6]"></div>
                                    </div>
                                ) : filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <EmployeeCard
                                            key={employee.id}
                                            employee={employee}
                                            isSelected={selectedEmployees.includes(employee.id)}
                                            projects={projects}
                                            handleEmployeeSelect={handleEmployeeSelect}
                                            handleOpenProjectDetails={handleOpenProjectDetails}
                                            isDisabled={!selectedProject}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        {isSkillMatchActive && selectedProject ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div>
                                                    <p className="text-lg font-medium text-[#52007C] dark:text-white mb-2">
                                                        No matching employees found
                                                    </p>
                                                    <p className="text-sm text-[#7A00B8] dark:text-[#D68BF9] max-w-md">
                                                        No employees have skills matching: <strong>{selectedProject.requiredSkills.map(s => s.name).join(', ')}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                        ) : showEmployeesWithoutProjects ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <FaUserSlash className="w-12 h-12 text-gray-400" />
                                                <p className="text-lg font-medium text-[#52007C] dark:text-white">
                                                    {t('projectManager.employeeAssign.noAvailableEmployees')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <FaSearch className="w-12 h-12 text-gray-400" />
                                                <p className="text-lg font-medium text-[#52007C] dark:text-white">
                                                    {t('projectManager.employeeAssign.noEmployeesMatchFilters')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && <PaginationControls />}
                        </div>
                    </div>

                    <ProjectDetailsPopup
                        project={projectDetailsPopup.project}
                        onClose={handleCloseProjectDetails}
                        employees={employees}
                    />

                    <DuplicateAssignmentDialog
                        isOpen={isDuplicateAssignmentOpen}
                        onClose={cancelDuplicateAssignmentWarning}
                        duplicateEmployees={duplicateEmployees}
                        selectedProject={selectedProject}
                    />

                    <RemoveEmployeeConfirmationDialog
                        isOpen={isRemoveConfirmationOpen}
                        onClose={cancelRemoveEmployee}
                        onConfirm={confirmRemoveEmployee}
                        employeeName={employeeToRemove?.name}
                        projectName={projectToRemoveFrom?.name}
                    />

                    {/* Conditionally render confirmation bar styles */}
                    {(selectedEmployees.length > 0 || selectedProject) && (
                        <BottomBarWithAvatars
                            selectedEmployees={selectedEmployees}
                            selectedProject={selectedProject}
                            employees={employees}
                            handleAssignEmployees={handleAssignEmployees}
                            clearSelections={clearSelections}
                        />
                    )}

                    <ConfirmationDialog
                        isOpen={isConfirmationOpen}
                        onClose={cancelAssignmentConfirmation}
                        onConfirm={confirmAssignment}
                        selectedEmployees={selectedEmployees}
                        selectedProject={selectedProject}
                        employees={employees}
                        projectRoles={availableRoles}
                        assignmentError={assignmentError}
                    />

                    <EditWorkloadModal
                        isOpen={isEditModalOpen}
                        assignment={selectedAssignment}
                        onClose={handleEditAssignmentClose}
                        onConfirm={handleEditAssignmentConfirm}
                        availableRoles={availableRoles}
                        employees={employees}
                        error={editAssignmentError}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagement;