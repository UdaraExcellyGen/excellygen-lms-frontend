import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaUserCircle, FaProjectDiagram, FaSearch, FaArrowLeft, FaFilter,
    FaFileExport, FaUsers, FaClock, FaObjectGroup, FaChevronDown,
    FaUserSlash, FaHashtag, FaExclamationTriangle
} from 'react-icons/fa';

// Import components
import MultiSelect from './components/MultiSelect';
import ProjectDetailsPopup from './components/ProjectDetailsPopup';
import DuplicateAssignmentDialog from './components/DuplicateAssignmentDialog';
import RemoveEmployeeConfirmationDialog from './components/RemoveEmployeeConfirmationDialog';
import BottomBarWithAvatars from './components/BottomBarWithAvatars';
import ConfirmationDialog from './components/ConfirmationDialog';
import EmployeeCard from './components/EmployeeCard';
import ProjectCard from './components/ProjectCard';

// Import types and mock data
import { Employee, Project } from './types/types';
import { employeesData, projectsData, techSkillsList, projectRoles, courseSkillMap } from './data/mockData';

const EmployeeManagement: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState<string[]>([]);
    const [expandedProjects, setExpandedProjects] = useState<number[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const [isSkillMatchActive, setIsSkillMatchActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [searchType, setSearchType] = useState('name');
    const [projectSearchType, setProjectSearchType] = useState('name');
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>(projectsData);
    const [employees, setEmployees] = useState<Employee[]>(employeesData);
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

    const multiSelectButtonRef = useRef<HTMLButtonElement>(null);

    const calculateEmployeeCurrentWorkload = (employeeId: number): number => {
        let totalWorkload = 0;

        // Go through all projects to find assignments for this employee
        projects.forEach(project => {
            // Find all assignments for this employee in this project (could have multiple roles)
            const employeeAssignments = project.assignedEmployees.filter(
                a => a.employeeId === employeeId
            );

            // Sum all workload percentages for this employee in this project
            employeeAssignments.forEach(assignment => {
                totalWorkload += assignment.workloadPercentage || 100;
            });
        });

        return totalWorkload;
    };

    const getEmployeeAvailableWorkload = (employeeId: number): number => {
        const currentWorkload = calculateEmployeeCurrentWorkload(employeeId);
        return Math.max(0, 100 - currentWorkload);
    };

    const getCategorizedProjects = () => {
        let filteredProjects = projects;

        filteredProjects = filteredProjects.filter(project => {
            const searchLower = projectSearchTerm.toLowerCase();
            if (projectSearchType === 'name') {
                return project.name.toLowerCase().includes(searchLower);
            } else if (projectSearchType === 'id') {
                return String(project.id).includes(searchLower);
            }
            return true;
        });

        if (projectStatusFilter !== 'All') {
            filteredProjects = filteredProjects.filter(project => project.status === projectStatusFilter);
        }

        return filteredProjects;
    };

    useEffect(() => {
        const assignRandomSkills = () => {
            const updatedEmployees = employees.map(employee => {
                let employeeSkills = [...employee.skills]; // Copy existing skills
                while (employeeSkills.length < 2) {
                    const randomIndex = Math.floor(Math.random() * techSkillsList.length);
                    const skill = techSkillsList[randomIndex];
                    if (!employeeSkills.includes(skill)) {
                        employeeSkills.push(skill);
                    }
                }
                return { ...employee, skills: employeeSkills };
            });
            setEmployees(updatedEmployees);
        };

        assignRandomSkills();
    }, []);

    useEffect(() => {
        const projectsWithInitialRoles = projects.map(project => ({
            ...project,
            initialRequiredRoles: project.requiredRoles.map(role => ({ ...role }))
        }));
        setProjects(projectsWithInitialRoles);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [statusDropdownRef]);

    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = "viewport";
        meta.content = "initial-scale=0.75";
        document.getElementsByTagName('head')[0].appendChild(meta);

        return () => {
            const head = document.getElementsByTagName('head')[0];
            const metaTag = head.querySelector('meta[name="viewport"][content="initial-scale=0.75"]');
            if (metaTag) {
                head.removeChild(metaTag);
            }
        };
    }, []);

    // Show warning message when no project is selected and user tries to select employee
    useEffect(() => {
        if (showWarningMessage) {
            const timer = setTimeout(() => {
                setShowWarningMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showWarningMessage]);

    const handleEmployeeSelect = (employeeId: number) => {
        if (!selectedProject) {
            // Show the warning message
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

    const toggleProjectExpansion = (projectId: number) => {
        setExpandedProjects(prev =>
            prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
        );
    };

    const toggleCategoryExpansion = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleAssignEmployees = () => {
        if (!selectedProject || selectedEmployees.length === 0) return;
        setIsConfirmationOpen(true);
        setAssignmentError('');
    };

    const confirmAssignment = (employeeAssignments: Record<number, { role: string, workloadPercentage: number }>) => {
        if (!selectedProject || selectedEmployees.length === 0) return;

        const rolesNotSelected = selectedEmployees.filter(empId => !employeeAssignments[empId]?.role);
        if (rolesNotSelected.length > 0) {
            setAssignmentError('Please select a role for each employee.');
            return;
        }

        const invalidWorkloads = selectedEmployees.filter(empId => {
            const assignment = employeeAssignments[empId];
            if (!assignment?.workloadPercentage || assignment.workloadPercentage <= 0) return true;

            const currentWorkload = calculateEmployeeCurrentWorkload(empId);
            const requestedWorkload = assignment.workloadPercentage;

            // Check if the requested workload would exceed 100%
            return currentWorkload + requestedWorkload > 100;
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

        let validAssignments = [];
        let redundantEmployees: Employee[] = [];

        selectedEmployees.forEach(empId => {
            const employee = employees.find(emp => emp.id === empId);
            if (!employee) return;

            const { role, workloadPercentage } = employeeAssignments[empId];

            const isRedundant = selectedProject.assignedEmployees.some(assignedEmp =>
                assignedEmp.employeeId === employee.id && assignedEmp.role === role
            );

            if (isRedundant) {
                redundantEmployees.push(employee);
            } else {
                validAssignments.push({
                    employeeId: empId,
                    role: role,
                    workloadPercentage: workloadPercentage
                });
            }
        });

        if (redundantEmployees.length > 0) {
            setDuplicateEmployees(redundantEmployees);
            setIsDuplicateAssignmentOpen(true);
            return;
        }

        const updatedProjects = projects.map(proj => {
            if (proj.id === selectedProject.id) {
                const newAssignments = validAssignments.map(assignment => ({
                    employeeId: assignment.employeeId,
                    role: assignment.role,
                    workloadPercentage: assignment.workloadPercentage
                }));

                let updatedRequiredRoles = proj.requiredRoles.map(roleItem => {
                    let assignedInThisBatch = 0;
                    newAssignments.forEach(assignment => {
                        if (assignment.role === roleItem.role) {
                            assignedInThisBatch++;
                        }
                    });
                    return { ...roleItem, count: Math.max(0, roleItem.count - assignedInThisBatch) };
                });

                return {
                    ...proj,
                    assignedEmployees: [...proj.assignedEmployees, ...newAssignments],
                    requiredRoles: updatedRequiredRoles
                };
            }
            return proj;
        });
        setProjects(updatedProjects);

        const updatedEmployees = employees.map(emp => {
            if (selectedEmployees.includes(emp.id) && !redundantEmployees.includes(emp)) {
                return {
                    ...emp,
                    activeProjects: [...emp.activeProjects, selectedProject.name]
                };
            }
            return emp;
        });
        setEmployees(updatedEmployees);

        setIsConfirmationOpen(false);
        setSelectedEmployees([]);
        setSelectedProject(null);
        setIsSkillMatchActive(false);
    };

    const cancelAssignmentConfirmation = () => {
        setIsConfirmationOpen(false);
        setAssignmentError('');
    };

    const cancelDuplicateAssignmentWarning = () => {
        setIsDuplicateAssignmentOpen(false);
        setDuplicateEmployees([]);
    };

    const handleRemoveFromProject = (projectId: number, employeeIdToRemove: number) => {
        setIsRemoveConfirmationOpen(false);
        setEmployeeToRemove(null);
        setProjectToRemoveFrom(null);

        const updatedProjects = projects.map(proj => {
            if (proj.id === projectId) {
                const removedAssignment = proj.assignedEmployees.find(assignment => assignment.employeeId === employeeIdToRemove);

                let updatedRequiredRoles = proj.requiredRoles.map(roleItem => {
                    if (removedAssignment && removedAssignment.role === roleItem.role) {
                        return { ...roleItem, count: roleItem.count + 1 };
                    }
                    return roleItem;
                });

                return {
                    ...proj,
                    assignedEmployees: proj.assignedEmployees.filter(assignment => assignment.employeeId !== employeeIdToRemove),
                    requiredRoles: updatedRequiredRoles
                };
            }
            return proj;
        });
        setProjects(updatedProjects);

        const updatedEmployees = employees.map(emp => {
            if (emp.id === employeeIdToRemove) {
                const projectToRemove = projects.find(p => p.id === projectId);
                return {
                    ...emp,
                    activeProjects: emp.activeProjects.filter(projectName =>
                        projectName !== (projectToRemove ? projectToRemove.name : '')
                    )
                };
            }
            return emp;
        });
        setEmployees(updatedEmployees);
    };

    const confirmRemoveEmployee = () => {
        if (employeeToRemove && projectToRemoveFrom) {
            handleRemoveFromProject(projectToRemoveFrom.id, employeeToRemove.id);
        }
    };

    const cancelRemoveEmployee = () => {
        setIsRemoveConfirmationOpen(false);
        setEmployeeToRemove(null);
        setProjectToRemoveFrom(null);
    };

    const triggerRemoveConfirmation = (projectId: number, employeeId: number, employeeName: string, projectName: string) => {
        const employeeData = employees.find(e => e.id === employeeId);
        const projectData = projects.find(p => p.id === projectId);
        if (employeeData && projectData) {
            setEmployeeToRemove(employeeData);
            setProjectToRemoveFrom(projectData);
            setIsRemoveConfirmationOpen(true);
        }
    };

    const filteredEmployees = employees.filter(employee => {
        let matchesSearch = false;
        if (searchType === 'name') {
            matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.role.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
            matchesSearch = String(employee.id).includes(searchTerm);
        }

        let matchesAvailability = true;

        const employeeSkillSet = new Set(employee.skills);

        const matchesSkills = skillFilter.length === 0 ||
            skillFilter.every(filterSkill =>
                Array.from(employeeSkillSet).some(empSkill =>
                    empSkill.toLowerCase() === filterSkill.toLowerCase() // Changed to strict equality
                )
            );

        const matchesNoProjectsFilter = !showEmployeesWithoutProjects || employee.activeProjects.length === 0;

        if (isSkillMatchActive && selectedProject) {
            const requiredProjectSkills = selectedProject.requiredSkills.map(skill =>
                skill.toLowerCase()
            );
            const hasRequiredSkill = requiredProjectSkills.some(requiredSkill =>
                Array.from(employeeSkillSet).some(empSkill =>
                    empSkill.toLowerCase() === requiredSkill // Changed to strict equality
                )
            );
            return matchesSearch && matchesAvailability && matchesSkills && hasRequiredSkill && matchesNoProjectsFilter;
        }

        return matchesSearch && matchesAvailability && matchesSkills && matchesNoProjectsFilter;
    });

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

    const categorizedProjects = getCategorizedProjects();
    const totalProjectsCount = categorizedProjects.length;

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
                                Project Assignment Dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <MultiSelect
                            value={skillFilter}
                            onChange={setSkillFilter}
                            options={techSkillsList}
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
                            Match Technologies
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    Projects ({totalProjectsCount})
                                </h2>
                                <div className="relative flex-grow max-w-sm ml-4">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8]" />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
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
                                            title="Search by Name"
                                        >
                                            <FaProjectDiagram /> <span>Name</span>
                                        </button>
                                        <button
                                            onClick={() => setProjectSearchType('id')}
                                            className={`px-3 py-1 rounded-r-md flex items-center gap-1 ${projectSearchType === 'id'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title="Search by ID"
                                        >
                                            <FaHashtag /> <span>ID</span>
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
                                            {projectStatusFilter} Statuses
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
                                                            {status} Statuses
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={scrollbarStyles} className="space-y-6 pr-2 h-full custom-scrollbar">
                                {getCategorizedProjects().map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        isSelected={selectedProject?.id === project.id}
                                        isExpanded={expandedProjects.includes(project.id)}
                                        employees={employees}
                                        handleProjectSelect={handleProjectSelect}
                                        toggleProjectExpansion={toggleProjectExpansion}
                                        triggerRemoveConfirmation={triggerRemoveConfirmation}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex flex-col">
                        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-[#52007C] dark:text-white font-unbounded">
                                    {isSkillMatchActive && selectedProject
                                        ? 'Matched Employees'
                                        : 'Available Employees'}{' '}
                                    ({filteredEmployees.length})
                                </h2>
                                <div className="relative flex-grow max-w-sm ml-4">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A00B8]" />
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
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
                                            title="Search by Name/Role"
                                        >
                                            <FaUserCircle /> <span>Name/Role</span>
                                        </button>
                                        <button
                                            onClick={() => setSearchType('id')}
                                            className={`px-3 py-1 rounded-r-md flex items-center gap-1 ${searchType === 'id'
                                                    ? 'bg-[#BF4BF6] text-white'
                                                    : 'bg-[#F6E6FF] dark:bg-[#1B0A3F] text-[#52007C] dark:text-[#D68BF9] hover:bg-[#e0c1f5] dark:hover:bg-[#4a006e]'
                                                }`}
                                            title="Search by ID"
                                        >
                                            <FaHashtag /> <span>ID</span>
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
                                    Free Bench
                                </button>
                            </div>
                            
                            {/* Warning message if no project is selected */}
                            {showWarningMessage && (
                                <div className="mb-4 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 transition-all duration-300 transform ease-in-out">
                                    <p className="text-sm flex items-center gap-2">
                                    <FaExclamationTriangle className="h-5 w-5" />
                                        Please select a project first before selecting employees
                                    </p>
                                </div>
                            )}
                            
                            {!selectedProject && (
                                <div className="mb-4 p-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600">
                                    <p className="text-sm flex items-center gap-2">
                                        <FaProjectDiagram className="h-5 w-5" />
                                        Select a project from the left panel to assign employees
                                    </p>
                                </div>
                            )}
                            
                            <div style={scrollbarStyles} className="space-y-4 pr-2 h-full custom-scrollbar">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <EmployeeCard
                                            key={employee.id}
                                            employee={employee}
                                            isSelected={selectedEmployees.includes(employee.id)}
                                            projects={projects}
                                            handleEmployeeSelect={handleEmployeeSelect}
                                            handleOpenProjectDetails={handleOpenProjectDetails}
                                            calculateWorkload={calculateEmployeeCurrentWorkload}
                                            isDisabled={!selectedProject}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-[#7A00B8] dark:text-[#D68BF9] italic">
                                        {isSkillMatchActive && selectedProject
                                            ? 'No employees match the project technologies.'
                                            : showEmployeesWithoutProjects
                                                ? 'No employees without assigned projects match the current filters.'
                                                : 'No employees match the current filters.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <ProjectDetailsPopup
                        project={projectDetailsPopup.project}
                        onClose={handleCloseProjectDetails}
                        darkMode={darkMode}
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
                        projectRoles={projectRoles}
                        assignmentError={assignmentError}
                        getEmployeeAvailableWorkload={getEmployeeAvailableWorkload}
                        calculateEmployeeCurrentWorkload={calculateEmployeeCurrentWorkload}
                    />
                </div>
            </div>
        </div>
    );
};

export default EmployeeManagement;