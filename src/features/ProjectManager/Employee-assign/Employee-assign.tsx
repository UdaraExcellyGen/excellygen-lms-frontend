// Path: src/features/ProjectManager/Employee-assign/Employee-assign.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FaUserCircle, FaProjectDiagram, FaSearch, FaArrowLeft,
    FaObjectGroup, FaChevronDown,
    FaUserSlash, FaHashtag, FaExclamationTriangle
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
import { employeeApi, projectApi, assignmentApi, resourceApi } from '../../../api/services/ProjectManager/employeeAssignmentService';

const EmployeeManagement: React.FC = () => {
    const { t } = useTranslation();
    const [darkMode] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState<string[]>([]);
    const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [isSkillMatchActive, setIsSkillMatchActive] = useState(false);
    const [searchType, setSearchType] = useState('name');
    const [projectSearchType, setProjectSearchType] = useState('name');

    // Data states
    const [projects, setProjects] = useState<Project[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [availableSkills, setAvailableSkills] = useState<string[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState({
        projects: false,
        employees: false,
        roles: false,
        skills: false
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

    const multiSelectButtonRef = useRef<HTMLButtonElement>(null);

    // Initialize data on component mount
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load projects when status filter changes
    useEffect(() => {
        loadProjects();
    }, [projectStatusFilter]);

    // Load employees when filters change
    useEffect(() => {
        loadEmployees();
    }, [searchTerm, skillFilter, showEmployeesWithoutProjects, isSkillMatchActive, selectedProject]);

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

    const loadEmployees = async () => {
        setIsLoading(prev => ({ ...prev, employees: true }));
        try {
            const filter: EmployeeFilter = {
                searchTerm: searchTerm || undefined,
                availableOnly: showEmployeesWithoutProjects || undefined,
                skills: skillFilter.length > 0 ? skillFilter : undefined
            };

            let employeesData: Employee[];

            if (isSkillMatchActive && selectedProject) {
                // Get employees matching project skills
                const projectSkills = selectedProject.requiredSkills.map(skill => skill.name);
                if (projectSkills.length > 0) {
                    employeesData = await employeeApi.getEmployeesBySkills(projectSkills);
                } else {
                    employeesData = await employeeApi.getAvailableEmployees(filter);
                }
            } else {
                employeesData = await employeeApi.getAvailableEmployees(filter);
            }

            setEmployees(employeesData);
        } catch (error) {
            console.error('Error loading employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setIsLoading(prev => ({ ...prev, employees: false }));
        }
    };

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
            await Promise.all([loadProjects(), loadEmployees()]);

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
            await Promise.all([loadProjects(), loadEmployees()]);
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

    const handleSkillMatch = () => {
        if (!selectedProject) {
            return;
        }
        setIsSkillMatchActive(!isSkillMatchActive);
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
    };

    // ADDED HANDLERS
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
            await Promise.all([loadProjects(), loadEmployees()]);

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
        const searchLower = projectSearchTerm.toLowerCase();
        if (projectSearchType === 'name') {
            return project.name.toLowerCase().includes(searchLower);
        } else if (projectSearchType === 'id') {
            return project.id.toLowerCase().includes(searchLower);
        }
        return true;
    });

    // Filter employees based on search
    const filteredEmployees = employees.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
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

    return (
        <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1920px] mx-auto">
                <header className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
                    <div className="flex items-center justify-start">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/project-manager/dashboard"
                                className="p-2 rounded-lg hover:bg-[#F6E6FF] dark:hover:bg-[#1B0A3F]
                                    text-[#52007C] dark:text-[#D68BF9] transition-colors"
                            >
                                <FaArrowLeft className="w-6 h-6" />
                            </Link>
                            <h1 className="text-2xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                {t('projectManager.employeeAssign.title')}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <LanguageSwitcher />
                        <MultiSelect
                            value={skillFilter}
                            onChange={setSkillFilter}
                            options={availableSkills}
                            darkMode={darkMode}
                            buttonRef={multiSelectButtonRef}
                        />
                        <button
                            onClick={handleSkillMatch}
                            disabled={!selectedProject}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
                                ${isSkillMatchActive && selectedProject
                                    ? 'bg-[#52007C] text-white'
                                    : selectedProject
                                        ? 'bg-[#D68BF9] dark:bg-[#BF4BF6] text-white hover:bg-[#BF4BF6] dark:hover:bg-[#D68BF9]'
                                        : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] opacity-50 cursor-not-allowed'
                                }`}
                            title="Filter employees to show only those who possess skills matching the selected project's required technologies."
                        >
                            <FaObjectGroup className="w-4 h-4" />
                            {t('projectManager.employeeAssign.matchTechnologies')}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    {t('projectManager.employeeAssign.projects')} ({filteredProjects.length})
                                </h2>
                                <div className="relative flex-grow max-w-sm ml-4">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8]" />
                                    <input
                                        type="text"
                                        placeholder={t('projectManager.employeeAssign.searchProjects')}
                                        value={projectSearchTerm}
                                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-24 py-2 rounded-lg border border-[#F6E6FF]
                                            dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F]
                                            text-[#52007C] dark:text-white focus:outline-none
                                            focus:ring-2 focus:ring-[#BF4BF6]"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                        <button
                                            onClick={() => setProjectSearchType('name')}
                                            className={`px-3 py-1 rounded-l-md flex items-center gap-1 ${projectSearchType === 'name'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title={t('projectManager.employeeAssign.searchByName')}
                                        >
                                            <FaProjectDiagram /> <span>{t('projectManager.employeeAssign.name')}</span>
                                        </button>
                                        <button
                                            onClick={() => setProjectSearchType('id')}
                                            className={`px-3 py-1 rounded-r-md flex items-center gap-1 ${projectSearchType === 'id'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title={t('projectManager.employeeAssign.searchById')}
                                        >
                                            <FaHashtag /> <span>{t('projectManager.employeeAssign.id')}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div ref={statusDropdownRef} className="relative">
                                        <button
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                            className="inline-flex justify-center w-full rounded-lg border border-[#F6E6FF]
                                                dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F] px-4 py-2 text-sm
                                                font-medium text-[#52007C] dark:text-white hover:bg-[#F6E6FF]
                                                dark:hover:bg-[#34137C] focus:outline-none focus:ring-2
                                                focus:ring-[#BF4BF6]"
                                        >
                                            {projectStatusFilter === 'All' ? t('projectManager.employeeAssign.allStatuses') : 
                                             projectStatusFilter === 'Active' ? t('projectManager.employeeAssign.activeStatuses') : 
                                             t('projectManager.employeeAssign.completedStatuses')}
                                            <FaChevronDown className="-mr-1 ml-2 h-5 w-5" />
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
                        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    {isSkillMatchActive && selectedProject
                                        ? t('projectManager.employeeAssign.matchedEmployees')
                                        : t('projectManager.employeeAssign.availableEmployees')}{' '}
                                    ({filteredEmployees.length})
                                </h2>
                                <div className="relative flex-grow max-w-sm ml-4">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8]" />
                                    <input
                                        type="text"
                                        placeholder={t('projectManager.employeeAssign.searchEmployees')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-24 py-2 rounded-lg border border-[#F6E6FF]
                                            dark:border-[#7A00B8] bg-white dark:bg-[#1B0A3F]
                                            text-[#52007C] dark:text-white focus:outline-none
                                            focus:ring-2 focus:ring-[#BF4BF6]"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                        <button
                                            onClick={() => setSearchType('name')}
                                            className={`px-3 py-1 rounded-l-md flex items-center gap-1 ${searchType === 'name'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title={t('projectManager.employeeAssign.searchByNameRole')}
                                        >
                                            <FaUserCircle /> <span>{t('projectManager.employeeAssign.searchByNameRole')}</span>
                                        </button>
                                        <button
                                            onClick={() => setSearchType('id')}
                                            className={`px-3 py-1 rounded-r-md flex items-center gap-1 ${searchType === 'id'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title={t('projectManager.employeeAssign.searchById')}
                                        >
                                            <FaHashtag /> <span>{t('projectManager.employeeAssign.id')}</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEmployeesWithoutProjects(!showEmployeesWithoutProjects)}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2
                                        ${showEmployeesWithoutProjects
                                            ? 'bg-[#52007C] text-white'
                                            : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#D68BF9] dark:hover:bg-[#34137C]'
                                        }`}
                                    title="Show employees without assigned projects"
                                >
                                    <FaUserSlash className="w-4 h-4" />
                                    {t('projectManager.employeeAssign.freeBench')}
                                </button>
                            </div>

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
                                    <p className="text-center text-[#7A00B8] dark:text-[#D68BF9] italic">
                                        {isSkillMatchActive && selectedProject
                                            ? t('projectManager.employeeAssign.noEmployeesMatch')
                                            : showEmployeesWithoutProjects
                                                ? t('projectManager.employeeAssign.noAvailableEmployees')
                                                : t('projectManager.employeeAssign.noEmployeesMatchFilters')}
                                    </p>
                                )}
                            </div>
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

                    {/* ADDED MODAL */}
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