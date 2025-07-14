// Path: src/features/ProjectManager/ProjectCruds/ProjectCruds.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Search, Plus, Edit, Trash2,
    ChevronDown, Menu, X as XIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import components
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import ProjectForm from './components/ProjectForm';
import TechnologyForm from './components/TechnologyForm';
import RoleForm from './components/RoleForm';
import LanguageSwitcher from '../../../components/common/LanguageSwitcher';

// Import API services
import { 
    getAllProjects, getProjectById, createProject, updateProject, deleteProject,
    getAllRoles, createRole, updateRole, deleteRole,
    getProjectTechnologies, createTechnology, updateTechnology, deleteTechnology
} from '../../../api/projectManagerApi';

// Import types
import { Project, EmployeeTechnology, ProjectRole, CreateProjectRequest, UpdateProjectRequest, CreateRoleRequest, UpdateRoleRequest } from './data/types';

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; 
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString; 
    }
};

const calculateRemainingDays = (deadlineStr: string | null | undefined): number | null => {
    if (!deadlineStr) return null;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let deadlineDate = new Date(deadlineStr);
        deadlineDate = new Date(
            deadlineDate.getFullYear(),
            deadlineDate.getMonth(),
            deadlineDate.getDate(),
            0, 0, 0, 0
        );
        const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const deadlineUTC = Date.UTC(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
        const differenceInTime = deadlineUTC - todayUTC;
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
        return differenceInDays;
    } catch (error) {
        console.error("Error calculating remaining days:", error);
        return null;
    }
};

const renderCreatedBy = (technology: EmployeeTechnology, t: (key: string) => string) => {
  const isPMCreated = technology.creatorType === 'project_manager';
  return (
    <>
      {isPMCreated ? (
        <span className="inline-flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          Project Manager
        </span>
      ) : (
        <span className="inline-flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Admin
        </span>
      )}
    </>
  );
};

const ProjectCRUD: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [projects, setProjects] = useState<Project[]>([]);
    const [employeeTechnologies, setEmployeeTechnologies] = useState<EmployeeTechnology[]>([]);
    const [availableTechnologies, setAvailableTechnologies] = useState<EmployeeTechnology[]>([]);
    const [isLoading, setIsLoading] = useState({
        projects: false,
        technologies: false,
        roles: false
    });    
    const [error, setError] = useState<{
        projects: string | null,
        technologies: string | null,
        roles: string | null,
        form: string | null
    }>({
        projects: null,
        technologies: null,
        roles: null,
        form: null
    });
    const [formErrors, setFormErrors] = useState({
        name: false,
        deadline: false,
        startDate: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [selectedTechnologiesDisplay, setSelectedTechnologiesDisplay] = useState<string[]>([]);
    const [showProjects, setShowProjects] = useState(true);
    const [isTechnologySectionActive, setIsTechnologySectionActive] = useState(false);
    const [isTechnologyFormOpen, setIsTechnologyFormOpen] = useState(false);
    const [editingTechnologyId, setEditingTechnologyId] = useState<number | string | null>(null);
    const [projectStatusFilter, setProjectStatusFilter] = useState('All');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [techStatusFilter, setTechStatusFilter] = useState('all');

    const [showRoles, setShowRoles] = useState(false);
    const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
    const [editingRoleId, setEditingRoleId] = useState<number | string | null>(null);
    const [showRoleForm, setShowRoleForm] = useState(false);
    const [roleFormData, setRoleFormData] = useState({ name: "" });
    const [roleFormErrors, setRoleFormErrors] = useState({ name: false });

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [projectIdToDelete, setProjectIdToDelete] = useState<number | string | null>(null);
    const [technologyIdToDelete, setTechnologyIdToDelete] = useState<number | string | null>(null);
    const [showTechnologyDeleteConfirmation, setShowTechnologyDeleteConfirmation] = useState(false);
    const [roleIdToDelete, setRoleIdToDelete] = useState<number | string | null>(null);
    const [showRoleDeleteConfirmation, setShowRoleDeleteConfirmation] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    const [formData, setFormData] = useState({
        name: "",
        status: "Active",
        deadline: "",
        description: "",
        shortDescription: "",
        requiredTechnologies: [] as { id: number | string, name: string }[],
        progress: 0,
        startDate: "",
        assignedRoles: [] as { roleId: number | string, roleName: string, amount: number }[],
    });
    const [technologyFormData, setTechnologyFormData] = useState({ name: "" });

    const [rolesLoaded, setRolesLoaded] = useState(false);
    const [roleNameMap, setRoleNameMap] = useState<Record<string | number, string>>({});

    useEffect(() => {
        if (pathname.includes('/technologies')) {
            setShowProjects(false);
            setIsTechnologySectionActive(true);
            setShowRoles(false);
        } else if (pathname.includes('/roles')) {
            setShowProjects(false);
            setIsTechnologySectionActive(false);
            setShowRoles(true);
        } else {
            setShowProjects(true);
            setIsTechnologySectionActive(false);
            setShowRoles(false);
        }
    }, [pathname]);

    useEffect(() => {
        const persistRoleMap = () => {
            if (projectRoles.length > 0) {
                const newRoleMap: Record<string | number, string> = {};
                projectRoles.forEach(role => {
                    newRoleMap[String(role.id)] = role.name;
                    const numId = parseInt(String(role.id), 10);
                    if (!isNaN(numId)) {
                        newRoleMap[numId] = role.name;
                    }
                });
                setRoleNameMap(newRoleMap);
                try {
                    localStorage.setItem('projectRoleNameMap', JSON.stringify(newRoleMap));
                    console.log('Role name map persisted to localStorage:', newRoleMap);
                } catch (err) {
                    console.error('Error saving role map to localStorage:', err);
                }
            }
        };
        persistRoleMap();
    }, [projectRoles]);

    const loadPersistedRoleMap = () => {
        try {
            const storedRoleMap = localStorage.getItem('projectRoleNameMap');
            if (storedRoleMap) {
                const parsedMap: Record<string | number, string> = JSON.parse(storedRoleMap);
                setRoleNameMap(parsedMap);
                console.log('Loaded role name map from localStorage:', parsedMap);
                return parsedMap;
            }
        } catch (err) {
            console.error('Error loading role map from localStorage:', err);
        }
        return {};
    };

    const updateProjectRoleNames = () => {
        if (projects.length === 0 || projectRoles.length === 0) return;
        console.log("Updating project role names with available roles:", 
            projectRoles.map(r => ({id: r.id, name: r.name})));
        
        const roleMap: Record<string | number, string> = {};
        projectRoles.forEach(role => {
            roleMap[String(role.id)] = role.name;
            const numId = parseInt(String(role.id), 10);
            if (!isNaN(numId)) { 
                 roleMap[numId] = role.name;
            }
        });
        
        const updatedProjects = projects.map(project => {
            if (!project.requiredRoles || project.requiredRoles.length === 0) {
                return project;
            }
            const updatedRoles = project.requiredRoles.map(role => {
                const stringId = String(role.roleId);
                const numId = parseInt(stringId, 10);
                let roleName = role.roleName; 
                if (!roleName && roleMap[stringId]) {
                    roleName = roleMap[stringId];
                }
                if (!roleName && !isNaN(numId) && roleMap[numId]) {
                    roleName = roleMap[numId];
                }
                if (!roleName) {
                    roleName = `Role ${role.roleId}`;
                    console.log(`Could not find name for role ID ${role.roleId} in roleMap:`, roleMap);
                }
                return { ...role, roleName };
            });
            return { ...project, requiredRoles: updatedRoles };
        });
        setProjects(updatedProjects);
    };

    const fetchRoles = async () => {
        console.log("Starting role fetch...");
        setIsLoading((prev) => ({ ...prev, roles: true }));
        setError((prev) => ({ ...prev, roles: null }));
        const persistedRoleMap = loadPersistedRoleMap();
        try {
            const roles = await getAllRoles();
            console.log("Fetched roles:", roles);
            const newRoleMap: Record<string | number, string> = {};
            roles.forEach(role => {
                newRoleMap[String(role.id)] = role.name;
                const numId = parseInt(String(role.id), 10);
                if (!isNaN(numId)) {
                    newRoleMap[numId] = role.name;
                }
            });
            console.log("Created role map:", newRoleMap);
            setRoleNameMap({...persistedRoleMap, ...newRoleMap});
            setProjectRoles(roles);
            setRolesLoaded(true);
            try {
                localStorage.setItem('projectRoleNameMap', JSON.stringify({...persistedRoleMap, ...newRoleMap}));
            } catch (err) {
                console.error('Error saving updated role map to localStorage:', err);
            }
            return roles;
        } catch (err: any) {
            console.error("Error fetching roles:", err);
            setError((prev) => ({ ...prev, roles: err.message || "Error fetching roles" }));
            return [];
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    const fetchTechnologies = async () => {
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        setError((prev) => ({ ...prev, technologies: null }));
        try {
            const technologies = await getProjectTechnologies();
            setEmployeeTechnologies(technologies);
            setAvailableTechnologies(technologies);
            return technologies;
        } catch (err: any) {
            setError((prev) => ({ ...prev, technologies: err.message || "Error fetching technologies" }));
            return [];
        } finally {
            setIsLoading((prev) => ({ ...prev, technologies: false }));
        }
    };

    const fetchProjects = async () => {
        console.log("Starting project fetch with role map:", roleNameMap);
        setIsLoading((prev) => ({ ...prev, projects: true }));
        setError((prev) => ({ ...prev, projects: null }));
        try {
            const fetchedProjects = await getAllProjects(
                projectStatusFilter !== 'All' ? projectStatusFilter : undefined
            );
            console.log("Fetched projects:", fetchedProjects);
            const enhancedProjects = fetchedProjects.map(project => {
                if (project.requiredRoles && project.requiredRoles.length > 0) {
                    const rolesWithNames = project.requiredRoles.map(role => {
                        const roleIdStr = String(role.roleId);
                        let roleNameValue = roleNameMap[roleIdStr];
                        if (!roleNameValue) {
                            const numId = parseInt(roleIdStr, 10);
                            if (!isNaN(numId)) {
                                roleNameValue = roleNameMap[numId];
                            }
                        }
                        if (!roleNameValue) {
                            roleNameValue = role.roleName || `Role ${role.roleId}`;
                            console.log(`Warning: Unable to find role name for ID ${roleIdStr} in role map:`, roleNameMap);
                        }
                        return { ...role, roleName: roleNameValue };
                    });
                    return { ...project, requiredRoles: rolesWithNames };
                }
                return project;
            });
            console.log("Enhanced projects with role names:", enhancedProjects);
            setProjects(enhancedProjects);
            return enhancedProjects;
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            setError((prev) => ({ ...prev, projects: err.message || "Error fetching projects" }));
            return [];
        } finally {
            setIsLoading((prev) => ({ ...prev, projects: false }));
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setRolesLoaded(false);
                console.log("=== Starting data loading sequence ===");
                setIsLoading({ projects: true, technologies: true, roles: true });
                await fetchRoles();
                console.log("Roles loaded and processed");
                await fetchTechnologies();
                console.log("Technologies loaded");
                await new Promise(resolve => setTimeout(resolve, 100));
                await fetchProjects();
                console.log("Projects loaded and processed");
            } catch (err) {
                console.error("Error in load sequence:", err);
            } finally {
                setIsLoading({ projects: false, technologies: false, roles: false });
                console.log("=== Data loading sequence complete ===");
            }
        };
        loadData();
    }, [projectStatusFilter]);

    useEffect(() => {
        updateProjectRoleNames();
    }, [projectRoles, projects.length]); 

    const validateForm = () => {
        const errors = {
            name: !formData.name.trim(),
            deadline: !formData.deadline,
            startDate: !formData.startDate
        };
        setFormErrors(errors);
        return !Object.values(errors).some((error) => error);
    };

    const handleCreate = async () => {
        setIsLoading((prev) => ({ ...prev, projects: true }));
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setError((prev) => ({ ...prev, form: null }));
        if (!validateForm()) {
            setError((prev) => ({ ...prev, form: "Please fill in all required fields" }));
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
        }
        try {
            const createProjectData: CreateProjectRequest = {
                name: formData.name,
                status: formData.status,
                deadline: formData.deadline || null,
                startDate: formData.startDate || null,
                description: formData.description,
                shortDescription: formData.shortDescription,
                progress: formData.progress,
                requiredTechnologyIds: formData.requiredTechnologies.map(tech => tech.id.toString()),
                requiredRoles: formData.assignedRoles.map(role => ({
                    roleId: role.roleId.toString(),
                    count: role.amount
                }))
            };
            const newProject = await createProject(createProjectData);
            const enhancedProject = {
                ...newProject,
                requiredRoles: newProject.requiredRoles?.map(role => {
                    const roleIdStr = String(role.roleId);
                    let roleNameValue = roleNameMap[roleIdStr];
                    if (!roleNameValue) {
                        const numId = parseInt(roleIdStr, 10);
                        if (!isNaN(numId)) {
                            roleNameValue = roleNameMap[numId];
                        }
                    }
                    if (!roleNameValue) {
                        const foundRole = projectRoles.find(r => String(r.id) === roleIdStr || 
                            (!isNaN(parseInt(roleIdStr, 10)) && parseInt(String(r.id), 10) === parseInt(roleIdStr, 10)));
                        roleNameValue = foundRole?.name || role.roleName || `Role ${role.roleId}`;
                    }
                    return { ...role, roleName: roleNameValue };
                }) || []
            };
            setProjects([...projects, enhancedProject]);
            setShowForm(false);
            resetForm();
            toast.success("Project created successfully");
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error creating project" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, projects: false }));
            setTimeout(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 500);
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        setIsLoading((prev) => ({ ...prev, projects: true }));
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setError((prev) => ({ ...prev, form: null }));
        if (!validateForm()) {
            setError((prev) => ({ ...prev, form: "Please fill in all required fields" }));
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
        }
        try {
            const updateProjectData: UpdateProjectRequest = {
                name: formData.name,
                status: formData.status,
                deadline: formData.deadline || null,
                startDate: formData.startDate || null,
                description: formData.description,
                shortDescription: formData.shortDescription,
                progress: formData.progress,
                requiredTechnologyIds: formData.requiredTechnologies.map(tech => tech.id.toString()),
                requiredRoles: formData.assignedRoles.map(role => ({
                    roleId: role.roleId.toString(),
                    count: role.amount
                }))
            };
            const updatedProject = await updateProject(editingId.toString(), updateProjectData);
            const enhancedProject = {
                ...updatedProject,
                requiredRoles: updatedProject.requiredRoles?.map(role => {
                    const roleIdStr = String(role.roleId);
                    let roleNameValue = roleNameMap[roleIdStr];
                    if (!roleNameValue) {
                        const numId = parseInt(roleIdStr, 10);
                        if (!isNaN(numId)) {
                            roleNameValue = roleNameMap[numId];
                        }
                    }
                    if (!roleNameValue) {
                        const foundRole = projectRoles.find(r => String(r.id) === roleIdStr || 
                            (!isNaN(parseInt(roleIdStr, 10)) && parseInt(String(r.id), 10) === parseInt(roleIdStr, 10)));
                        roleNameValue = foundRole?.name || role.roleName || `Role ${role.roleId}`;
                    }
                    return { ...role, roleName: roleNameValue };
                }) || []
            };
            setProjects(projects.map(project => 
                project.id === editingId ? enhancedProject : project
            ));
            setEditingId(null);
            setShowForm(false);
            resetForm();
            toast.success("Project updated successfully");
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error updating project" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, projects: false }));
            setTimeout(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 500);
        }
    };

    const handleDelete = (id: number | string) => {
        setProjectIdToDelete(id);
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectIdToDelete) return;
        setIsLoading((prev) => ({ ...prev, projects: true }));
        try {
            await deleteProject(projectIdToDelete.toString());
            setProjects(projects.filter(project => project.id !== projectIdToDelete));
            setShowDeleteConfirmation(false);
            setProjectIdToDelete(null);
            toast.success("Project deleted successfully");
        } catch (err: any) {
            setError((prev) => ({ ...prev, projects: err.message || "Error deleting project" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, projects: false }));
        }
    };

    const cancelDeleteProject = () => {
        setShowDeleteConfirmation(false);
        setProjectIdToDelete(null);
    };

    const handleCreateTechnology = async () => {
        setError((prev) => ({ ...prev, form: null }));
        if (!technologyFormData.name.trim()) {
            setError((prev) => ({ ...prev, form: "Technology name is required" }));
            return;
        }
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        try {
            const techName = technologyFormData.name.trim();
            const newTechnology = await createTechnology({ name: techName });
            setEmployeeTechnologies([...employeeTechnologies, newTechnology]);
            setAvailableTechnologies([...availableTechnologies, newTechnology]);
            setIsTechnologyFormOpen(false);
            resetTechnologyForm();
            toast.success("Technology created successfully");
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError((prev) => ({ ...prev, form: "You need Admin privileges to manage technologies" }));
                toast.error("Admin privileges required to manage technologies");
            } else {
                setError((prev) => ({ ...prev, form: err.message || "Error creating technology" }));
                toast.error(err.message || "Error creating technology");
            }
        } finally {
            setIsLoading((prev) => ({ ...prev, technologies: false }));
        }
    };

    const handleUpdateTechnology = async () => {
        if (!editingTechnologyId) return;
        setError((prev) => ({ ...prev, form: null }));
        if (!technologyFormData.name.trim()) {
            setError((prev) => ({ ...prev, form: "Technology name is required" }));
            return;
        }
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        try {
            const technology = employeeTechnologies.find(tech => tech.id === editingTechnologyId);
            if (technology && technology.creatorType !== 'project_manager') {
                setError((prev) => ({ ...prev, form: t('projectManager.projectCruds.adminCreated') }));
                toast.error(t('projectManager.projectCruds.adminCreated'));
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            if (technology?.status !== 'active') {
                setError((prev) => ({ ...prev, form: t('projectManager.projectCruds.inactiveCannotEdit') }));
                toast.error(t('projectManager.projectCruds.inactiveCannotEdit'));
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            const techName = technologyFormData.name.trim();
            const updatedTechnology = await updateTechnology(
                editingTechnologyId.toString(), 
                { name: techName }
            );
            setEmployeeTechnologies(employeeTechnologies.map(tech => 
                tech.id === editingTechnologyId ? updatedTechnology : tech
            ));
            setAvailableTechnologies(availableTechnologies.map(tech => 
                tech.id === editingTechnologyId ? updatedTechnology : tech
            ));
            setEditingTechnologyId(null);
            setIsTechnologyFormOpen(false);
            resetTechnologyForm();
            toast.success("Technology updated successfully");
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError((prev) => ({ ...prev, form: "You need Admin privileges to manage technologies" }));
                toast.error("Admin privileges required to manage technologies");
            } else {
                setError((prev) => ({ ...prev, form: err.message || "Error updating technology" }));
                toast.error(err.message || "Error updating technology");
            }
        } finally {
            setIsLoading((prev) => ({ ...prev, technologies: false }));
        }
    };

    // Helper function to check if technology is in use
    const isTechnologyInUse = (technologyId: number | string): boolean => {
        return projects.some(project => 
            project.requiredSkills?.some(skill => skill.id === technologyId)
        );
    };

    // Helper function to check if role is in use
    const isRoleInUse = (roleId: number | string): boolean => {
        return projects.some(project => 
            project.requiredRoles?.some(role => 
                String(role.roleId) === String(roleId)
            )
        );
    };
    
    // Updated handleDeleteTechnologyConfirmation function
    const handleDeleteTechnologyConfirmation = (id: number | string) => {
        const technology = employeeTechnologies.find((tech) => tech.id === id);
        if (technology) {
            if (technology.creatorType !== 'project_manager') {
                toast.error(t('projectManager.projectCruds.adminCreatedDelete'));
                return;
            }
            if (technology.status !== 'active') {
                toast.error(t('projectManager.projectCruds.inactiveCannotDelete'));
                return;
            }
            
            if (isTechnologyInUse(id)) {
                toast.error(t('projectManager.projectCruds.technologyInUse'));
                return;
            }
            
            setTechnologyIdToDelete(id);
            setShowTechnologyDeleteConfirmation(true);
        }
    };

    // Updated confirmDeleteTechnology function
    const confirmDeleteTechnology = async () => {
        if (!technologyIdToDelete) return;
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        try {
            const technology = employeeTechnologies.find(tech => tech.id === technologyIdToDelete);
            // These checks are technically redundant if handleDeleteTechnologyConfirmation does its job,
            // but good for safety if confirmDeleteTechnology is ever called directly.
            if (technology && technology.creatorType !== 'project_manager') {
                setError((prev) => ({ ...prev, technologies: t('projectManager.projectCruds.adminCreatedDelete') }));
                toast.error(t('projectManager.projectCruds.adminCreatedDelete'));
                setShowTechnologyDeleteConfirmation(false);
                setTechnologyIdToDelete(null);
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            if (technology?.status !== 'active') {
                setError((prev) => ({ ...prev, technologies: t('projectManager.projectCruds.inactiveCannotDelete') }));
                toast.error(t('projectManager.projectCruds.inactiveCannotDelete'));
                setShowTechnologyDeleteConfirmation(false);
                setTechnologyIdToDelete(null);
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            
            await deleteTechnology(technologyIdToDelete.toString());
            setEmployeeTechnologies(employeeTechnologies.filter(tech => tech.id !== technologyIdToDelete));
            setAvailableTechnologies(availableTechnologies.filter(tech => tech.id !== technologyIdToDelete));
            setShowTechnologyDeleteConfirmation(false);
            setTechnologyIdToDelete(null);
            toast.success("Technology deleted successfully");
        } catch (err: any) {
            console.error('Error in deleteTechnology:', err);
            
            let errorMessage = "Error deleting technology";
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;
                
                if (status === 403) {
                    errorMessage = "You need Admin privileges to manage technologies";
                } else if (status === 400) {
                    if (typeof data === 'string') {
                        if (data.includes("in use") || data.includes("assigned") || data.includes("projects")) {
                            errorMessage = t('projectManager.projectCruds.technologyInUse');
                        } else {
                            errorMessage = data;
                        }
                    } else if (data?.message) {
                        if (data.message.includes("in use") || data.message.includes("assigned") || data.message.includes("projects")) {
                            errorMessage = t('projectManager.projectCruds.technologyInUse');
                        } else {
                            errorMessage = data.message;
                        }
                    } else if (data?.error) {
                        errorMessage = data.error;
                    }
                } else if (status === 409) {
                    errorMessage = t('projectManager.projectCruds.technologyInUse');
                }
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection.";
            } else {
                errorMessage = err.message || "Error deleting technology";
            }
            
            setError((prev) => ({ ...prev, technologies: errorMessage }));
            toast.error(errorMessage);
            
            setShowTechnologyDeleteConfirmation(false);
            setTechnologyIdToDelete(null);
        } finally {
            setIsLoading((prev) => ({ ...prev, technologies: false }));
        }
    };

    const cancelDeleteTechnology = () => {
        setShowTechnologyDeleteConfirmation(false);
        setTechnologyIdToDelete(null);
    };

    const handleCreateRole = async () => {
        setError((prev) => ({ ...prev, form: null }));
        if (!validateRoleForm()) {
            setError((prev) => ({ ...prev, form: "Please fill in the role name" }));
            return;
        }
        setIsLoading((prev) => ({ ...prev, roles: true }));
        try {
            const createRoleData: CreateRoleRequest = { name: roleFormData.name.trim() };
            const newRole = await createRole(createRoleData);
            setProjectRoles([...projectRoles, newRole]);
            setShowRoleForm(false);
            resetRoleForm();
            toast.success("Role created successfully");
            fetchProjects();
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error creating role" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    const handleUpdateRole = async () => {
        if (!editingRoleId) return;
        setError((prev) => ({ ...prev, form: null }));
        if (!validateRoleForm()) {
            setError((prev) => ({ ...prev, form: "Role name is required" }));
            return;
        }
        setIsLoading((prev) => ({ ...prev, roles: true }));
        try {
            const updateRoleData: UpdateRoleRequest = { name: roleFormData.name.trim() };
            const updatedRole = await updateRole(editingRoleId.toString(), updateRoleData);
            setProjectRoles(projectRoles.map(role => 
                role.id === editingRoleId ? updatedRole : role
            ));
            setShowRoleForm(false);
            setEditingRoleId(null);
            resetRoleForm();
            toast.success("Role updated successfully");
            fetchProjects();
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error updating role" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    // Updated handleDeleteRoleConfirmation function
    const handleDeleteRoleConfirmation = (id: number | string) => {
        if (isRoleInUse(id)) {
            toast.error(t('projectManager.projectCruds.roleInUse'));
            return;
        }
        
        setRoleIdToDelete(id);
        setShowRoleDeleteConfirmation(true);
    };

    // Updated confirmDeleteRole function
    const confirmDeleteRole = async () => {
        if (!roleIdToDelete) return;
        setIsLoading((prev) => ({ ...prev, roles: true }));
        try {
            await deleteRole(roleIdToDelete.toString());
            setProjectRoles(projectRoles.filter(role => role.id !== roleIdToDelete));
            setShowRoleDeleteConfirmation(false);
            setRoleIdToDelete(null);
            toast.success("Role deleted successfully");
            fetchProjects(); 
        } catch (err: any) {
            console.error('Error in deleteRole:', err);
            
            let errorMessage = "Error deleting role";
            if (err.response) {
                const status = err.response.status;
                const data = err.response.data;
                
                if (status === 403) {
                    errorMessage = "You need Admin privileges to manage roles";
                } else if (status === 400 || status === 409) { 
                    if (typeof data === 'string') {
                        if (data.includes("in use") || data.includes("assigned") || data.includes("projects")) {
                            errorMessage = t('projectManager.projectCruds.roleInUse');
                        } else {
                            errorMessage = data;
                        }
                    } else if (data?.message) {
                        if (data.message.includes("in use") || data.message.includes("assigned") || data.message.includes("projects")) {
                            errorMessage = t('projectManager.projectCruds.roleInUse');
                        } else {
                            errorMessage = data.message;
                        }
                    } else if (data?.error) {
                        errorMessage = data.error;
                    }
                }
            } else if (err.request) {
                errorMessage = "No response from server. Please check your connection.";
            } else {
                errorMessage = err.message || "Error deleting role";
            }
            
            setError((prev) => ({ ...prev, roles: errorMessage }));
            toast.error(errorMessage);
            
            setShowRoleDeleteConfirmation(false);
            setRoleIdToDelete(null);
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    const cancelDeleteRole = () => {
        setShowRoleDeleteConfirmation(false);
        setRoleIdToDelete(null);
    };

    const resetForm = () => {
        setFormData({
            name: "", status: "Active", deadline: "", description: "",
            shortDescription: "", requiredTechnologies: [], progress: 0,
            startDate: "", assignedRoles: [],
        });
        setSelectedTechnologiesDisplay([]);
        setFormErrors({ name: false, deadline: false, startDate: false });
        setError((prev) => ({ ...prev, form: null }));
    };

    const resetTechnologyForm = () => {
        setTechnologyFormData({ name: "" });
    };

    const resetRoleForm = () => {
        setRoleFormData({ name: "" });
        setRoleFormErrors({ name: false });
        setError((prev) => ({ ...prev, form: null }));
    };

    const startEdit = async (id: number | string) => {
        try {
            const project = await getProjectById(id.toString());
            if (project) {
                const formatDateForInput = (dateString: string | null | undefined) => {
                    if (!dateString) return '';
                    try {
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) return '';
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    } catch (error) {
                        console.error("Error formatting date for input:", error);
                        return '';
                    }
                };
                const requiredTechnologiesObjects = (project.requiredSkills || []).map((tech) => ({
                    id: tech.id, name: tech.name
                }));
                const selectedTechnologies = requiredTechnologiesObjects.map((tech) => tech.name);
                let assignedRoles: { roleId: number | string, roleName: string, amount: number }[] = [];
                if (project.requiredRoles && project.requiredRoles.length > 0) {
                    console.log("Project requiredRoles:", project.requiredRoles);
                    assignedRoles = project.requiredRoles.map((role) => {
                        const roleIdStr = String(role.roleId);
                        let roleNameValue = roleNameMap[roleIdStr];
                        if (!roleNameValue) {
                            const numId = parseInt(roleIdStr, 10);
                            if (!isNaN(numId)) {
                                roleNameValue = roleNameMap[numId];
                            }
                        }
                        if (!roleNameValue) {
                            const foundRole = projectRoles.find(r => 
                                String(r.id) === roleIdStr || 
                                (!isNaN(parseInt(roleIdStr, 10)) && parseInt(String(r.id), 10) === parseInt(roleIdStr, 10))
                            );
                            roleNameValue = role.roleName || (foundRole ? foundRole.name : `Role ${role.roleId}`);
                        }
                        console.log(`Role ${roleIdStr} mapped to name: ${roleNameValue}`);
                        return { roleId: role.roleId, roleName: roleNameValue, amount: role.count };
                    });
                }
                console.log("Setting form with assignedRoles:", assignedRoles);
                setFormData({
                    name: project.name || '', status: project.status || 'Active',
                    deadline: formatDateForInput(project.deadline),
                    description: project.description || '', shortDescription: project.shortDescription || '',
                    requiredTechnologies: requiredTechnologiesObjects,
                    progress: project.progress || 0, startDate: formatDateForInput(project.startDate),
                    assignedRoles: assignedRoles,
                });
                setSelectedTechnologiesDisplay(selectedTechnologies);
                setEditingId(id);
                setShowForm(true);
            }
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error fetching project details" }));
        }
    };

    const startEditTechnology = (id: number | string) => {
        const technology = employeeTechnologies.find((tech) => tech.id === id);
        if (technology) {
            if (technology.creatorType !== 'project_manager') {
                toast.error(t('projectManager.projectCruds.adminCreated'));
                return;
            }
            if (technology.status !== 'active') {
                toast.error(t('projectManager.projectCruds.inactiveCannotEdit'));
                return;
            }
            setTechnologyFormData({ name: technology.name });
            setEditingTechnologyId(id);
            setIsTechnologyFormOpen(true);
        }
    };

    const startEditRole = (id: number | string) => {
        const role = projectRoles.find((role) => role.id === id);
        if (role) {
            setRoleFormData({ name: role.name });
            setEditingRoleId(id);
            setShowRoleForm(true);
        }
    };

    const handleTechnologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTechnologyNames = Array.from(e.target.selectedOptions, (option) => option.value);
        const selectedTechnologyObjects = availableTechnologies
            .filter((tech) => selectedTechnologyNames.includes(tech.name))
            .map((tech) => ({ id: tech.id, name: tech.name }));
        setFormData((prevFormData) => ({
            ...prevFormData, requiredTechnologies: selectedTechnologyObjects
        }));
        setSelectedTechnologiesDisplay(selectedTechnologyNames);
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const roleIdStr = e.target.value; 
        let roleNameValue: string | undefined = roleNameMap[roleIdStr]; 

        if (!roleNameValue) { 
            const numId = parseInt(roleIdStr, 10);
            if (!isNaN(numId)) {
                roleNameValue = roleNameMap[numId];
            }
        }
        
        if (!roleNameValue) {
            const foundRole = projectRoles.find(r => String(r.id) === roleIdStr);
            roleNameValue = foundRole?.name;
        }
        
        const finalRoleName: string = roleNameValue || `Role ${roleIdStr}`;

        console.log(`Role selected: ID=${roleIdStr}, Name=${finalRoleName}`);
        setFormData((prevFormData) => {
            const updatedRoles = [...prevFormData.assignedRoles];
            updatedRoles[index] = { ...updatedRoles[index], roleId: roleIdStr, roleName: finalRoleName };
            return { ...prevFormData, assignedRoles: updatedRoles };
        });
    };

    const handleRoleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const amount = parseInt(e.target.value, 10) || 0;
        setFormData((prevFormData) => {
            const updatedRoles = [...prevFormData.assignedRoles];
            updatedRoles[index] = { ...updatedRoles[index], amount };
            return { ...prevFormData, assignedRoles: updatedRoles };
        });
    };

    const addRoleAssignment = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            assignedRoles: [...prevFormData.assignedRoles, { roleId: "", roleName: "", amount: 1 }],
        }));
    };

    const removeRoleAssignment = (index: number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            assignedRoles: prevFormData.assignedRoles.filter((_, i) => i !== index),
        }));
    };

    const removeTechnology = (techName: string) => {
        const updatedTechs = formData.requiredTechnologies.filter((t) => t.name !== techName);
        setFormData((prevFormData) => ({
            ...prevFormData, requiredTechnologies: updatedTechs
        }));
        setSelectedTechnologiesDisplay(updatedTechs.map((t) => t.name));
    };

    const handleFormInputChange = (field: string, value: string | number) => {
        setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
        if (field === 'name' || field === 'deadline' || field === 'startDate') {
            setFormErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
        }
    };

    const validateRoleForm = () => {
        const errors = { name: !roleFormData.name.trim() };
        setRoleFormErrors(errors);
        return !Object.values(errors).some((error) => error);
    };

    const filteredProjects = projects.filter((project) => {
        const searchLower = searchTerm.toLowerCase();
        const searchMatch = project.name.toLowerCase().includes(searchLower);
        const statusMatch = projectStatusFilter === 'All' || project.status === projectStatusFilter;
        return searchMatch && statusMatch;
    });

    const filteredTechnologies = employeeTechnologies.filter((tech) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = tech.name.toLowerCase().includes(searchLower);
        const matchesStatus = techStatusFilter === 'all' || tech.status === techStatusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredRoles = projectRoles.filter((role) => {
        const searchLower = searchTerm.toLowerCase();
        return role.name.toLowerCase().includes(searchLower);
    });

    const toggleSection = (section: 'projects' | 'technologies' | 'roles') => {
        if (section === 'projects') {
            navigate('/project-manager/project-cruds');
        } else if (section === 'technologies') {
            navigate('/project-manager/project-cruds/technologies');
        } else if (section === 'roles') {
            navigate('/project-manager/project-cruds/roles');
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#52007C] p-2 sm:p-4 md:p-6 lg:p-8 font-['Nunito_Sans']">
            <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6">
                <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-4">                        
                        <button
                            onClick={() => navigate('/project-manager/dashboard')}
                            className="p-2 hover:bg-pale-purple rounded-full transition-all duration-300"
                           title="Go back to dashboard" 
                            aria-label="Go back to dashboard"
                        > 
                            <ArrowLeft size={20} className="text-[#BF4BF6]" />
                        </button>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 md:gap-4">
                            <h1 className="text-lg md:text-2xl font-['Unbounded'] text-gradient truncate">
                                {showProjects ? t('projectManager.projectCruds.title') :
                                    isTechnologySectionActive ? t('projectManager.projectCruds.technologyManagement') :
                                        showRoles ? t('projectManager.projectCruds.roleManagement') : 'Management Dashboard'}
                            </h1>
                            <div className="sm:hidden ml-auto">
                                <button 
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-[#52007C] hover:bg-[#F6E6FF] rounded-full"
                                >
                                    {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                            <div className="hidden sm:flex flex-wrap gap-2 items-center">
                                <LanguageSwitcher />
                                <button
                                    onClick={() => toggleSection('projects')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${showProjects ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    {t('projectManager.projectCruds.title')}
                                </button>
                                <button
                                    onClick={() => toggleSection('technologies')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${isTechnologySectionActive ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    {t('projectManager.projectCruds.technologies')}
                                </button>
                                <button
                                    onClick={() => toggleSection('roles')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${showRoles ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    {t('projectManager.projectCruds.roles')}
                                </button>
                            </div>
                        </div>
                    </div>
                    {mobileMenuOpen && (
                        <div className="sm:hidden mt-4 flex flex-col space-y-2 bg-[#F6E6FF] p-3 rounded-xl animate-modalEnter">
                            <button
                                onClick={() => toggleSection('projects')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${showProjects ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                {t('projectManager.projectCruds.title')}
                            </button>
                            <button
                                onClick={() => toggleSection('technologies')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${isTechnologySectionActive ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                {t('projectManager.projectCruds.technologies')}
                            </button>
                            <button
                                onClick={() => toggleSection('roles')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${showRoles ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                {t('projectManager.projectCruds.roles')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {(isLoading.projects || isLoading.technologies || isLoading.roles) && (
                <div className="fixed top-4 right-4 bg-white p-4 rounded-xl shadow-lg z-50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#BF4BF6]"></div>
                </div>
            )}
            {(error.projects || error.technologies || error.roles || error.form) && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50">
                    <p>{error.projects || error.technologies || error.roles || error.form}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6 p-4 md:p-6">
                {showProjects ? (
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
                        <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder={t('projectManager.projectCruds.searchProjects')} value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <button
                                    data-status-dropdown 
                                    className="w-full sm:w-auto px-4 py-2 bg-white rounded-lg border border-gray-200 text-[#1B0A3F] hover:bg-pale-purple transition-all duration-300 focus-ring flex items-center justify-between"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                >
                                    <span>
                                        {projectStatusFilter === 'All' 
                                            ? t('projectManager.projectCruds.allStatuses')
                                            : projectStatusFilter === 'Active' 
                                                ? t('projectManager.projectCruds.activeStatuses') 
                                                : t('projectManager.projectCruds.completedStatuses')
                                        }
                                    </span>
                                    <ChevronDown size={16} className="ml-2" />
                                </button>
                                {isStatusDropdownOpen && (
                                    <div className="fixed inset-0 z-[9999]" onClick={() => setIsStatusDropdownOpen(false)}>
                                        <div
                                            className="absolute bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-modalEnter w-full max-w-[200px] sm:w-auto"
                                            style={(() => {
                                                const triggerElement = document.querySelector('[data-status-dropdown]');
                                                const rect = triggerElement?.getBoundingClientRect();
                                                return {
                                                    top: rect ? rect.bottom + window.scrollY + 5 : 5,
                                                    left: rect ? rect.left + window.scrollX : 0,
                                                    width: rect ? rect.width : 200,
                                                };
                                            })()}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {['All', 'Active', 'Completed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setProjectStatusFilter(status);
                                                        setIsStatusDropdownOpen(false);
                                                    }}
                                                    className={`w-full px-4 py-2 text-left text-sm transition-all duration-200 ${projectStatusFilter === status ? 'bg-gradient-primary text-white' : 'hover:bg-pale-purple text-[#1B0A3F]'}`}
                                                >
                                                    {status === 'All' 
                                                        ? t('projectManager.projectCruds.allStatuses')
                                                        : status === 'Active' 
                                                            ? t('projectManager.projectCruds.activeStatuses')
                                                            : t('projectManager.projectCruds.completedStatuses')
                                                    }
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-full hover:bg-pale-purple transition-all duration-300 flex items-center justify-center gap-2 shadow-soft"
                            >
                                <Plus size={18} />
                                <span className="whitespace-nowrap">{t('projectManager.projectCruds.addProject')}</span>
                            </button>
                        </div>
                    </div>
                ) : isTechnologySectionActive ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:flex-grow sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder={t('projectManager.projectCruds.searchTechnologies')} value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>
                        <select
                            value={techStatusFilter} onChange={(e) => setTechStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                        >
                            <option value="all">{t('projectManager.projectCruds.allStatus')}</option>
                            <option value="active">Active</option>
                            <option value="inactive">{t('projectManager.projectCruds.inactive')}</option>
                        </select>
                        <button
                            onClick={() => { setIsTechnologyFormOpen(true); setEditingTechnologyId(null); resetTechnologyForm(); }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-full hover:bg-pale-purple transition-all duration-300 flex items-center justify-center gap-2 shadow-soft"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">{t('projectManager.projectCruds.addTechnology')}</span>
                        </button>
                    </div>
                ) : showRoles ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:flex-grow sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text" placeholder={t('projectManager.projectCruds.searchRoles')} value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>
                        <button
                            onClick={() => { setShowRoleForm(true); setEditingRoleId(null); resetRoleForm(); }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-full hover:bg-pale-purple transition-all duration-300 flex items-center justify-center gap-2 shadow-soft"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">{t('projectManager.projectCruds.addRole')}</span>
                        </button>
                    </div>
                ) : null}
            </div>

            {showProjects ? (
                <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 md:p-6">
                    {isLoading.projects || !rolesLoaded ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF4BF6]"></div>
                            <p className="ml-2 text-indigo">
                                {!rolesLoaded ? "Loading roles..." : "Loading projects..."}
                            </p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-8 text-indigo">
                            {t('projectManager.projectCruds.noProjectsFound')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                            <div className="min-w-[768px] px-3 sm:px-0 sm:min-w-0">
                                <table className="w-full border-separate border-spacing-0">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.employeeAssign.name')}</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Status</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.cards.deadline')}</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm hidden md:table-cell">{t('projectManager.projectCruds.technologies')}</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm hidden lg:table-cell">{t('projectManager.projectCruds.roles')}</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="border-b border-gray-200 hover:bg-[#F6E6FF]/50 transition-all duration-300 card-hover"
                                            >
                                                <td className="px-2 sm:px-4 py-3 text-indigo font-medium text-sm">{project.name}</td>
                                                <td className="px-2 sm:px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${project.status === 'Active' ? 'bg-green-100 text-green-600 badge-pulse' : project.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {project.status === 'Active' 
                                                            ? t('projectManager.employeeAssign.active') 
                                                            : project.status === 'Completed' 
                                                                ? t('projectManager.employeeAssign.completed')
                                                                : project.status
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 text-indigo text-sm">
                                                    {formatDate(project.deadline)}
                                                    {project.deadline && (
                                                        <div>
                                                            {(() => {
                                                                const remainingDays = calculateRemainingDays(project.deadline);
                                                                if (remainingDays === null) return null;
                                                                return (
                                                                    <span className={`text-xs font-medium ${remainingDays < 0 ? 'text-red-500' : remainingDays <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                                                                        {remainingDays < 0 ? `${Math.abs(remainingDays)} days overdue` : remainingDays === 0 ? 'Due today' : `${remainingDays} days left`}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 text-indigo text-sm hidden md:table-cell">
                                                    {project.requiredSkills && project.requiredSkills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.requiredSkills.map((tech, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                                    {tech.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-indigo text-xs">No technologies</span>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 text-indigo text-sm hidden lg:table-cell">
                                                    {project.requiredRoles && project.requiredRoles.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.requiredRoles.map((role, idx) => {
                                                                const roleIdStr = String(role.roleId);
                                                                let tempRoleName: string | undefined = roleNameMap[roleIdStr];
                                                                if (!tempRoleName) {
                                                                    const numId = parseInt(roleIdStr, 10);
                                                                    if (!isNaN(numId)) {
                                                                        tempRoleName = roleNameMap[numId];
                                                                    }
                                                                }
                                                                if (!tempRoleName) {
                                                                    tempRoleName = role.roleName; 
                                                                }
                                                                if (!tempRoleName) {
                                                                    const foundRole = projectRoles.find(r => 
                                                                        String(r.id) === roleIdStr || 
                                                                        (!isNaN(parseInt(roleIdStr, 10)) && 
                                                                         parseInt(String(r.id), 10) === parseInt(roleIdStr, 10)));
                                                                    if (foundRole) {
                                                                        tempRoleName = foundRole.name; 
                                                                    }
                                                                }
                                                                const finalRoleName: string = tempRoleName || `Role ${roleIdStr}`;
                                                                if (!tempRoleName) { 
                                                                    console.log(`Unable to find name for role ID ${roleIdStr}, using fallback "${finalRoleName}"`);
                                                                }
                                                                return (
                                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                                        <span className="font-bold mr-1">{role.count}×</span> {finalRoleName}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-indigo text-xs">No roles</span>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(project.id)}
                                                            className="p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-[#BF4BF6] transition-all-300"
                                                            aria-label="Edit project"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(project.id)}
                                                            className="p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-red-500 transition-all-300"
                                                            aria-label="Delete project"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : isTechnologySectionActive ? (
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                    <h3 className="text-xl text-russian-violet font-['Unbounded'] mb-4">{t('projectManager.projectCruds.technologies')}</h3>
                    <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                        <div className="min-w-[500px] px-3 sm:px-0 sm:min-w-0">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.technologyName')}</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Status</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.createdBy')}</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading.technologies ? (
                                        <tr><td colSpan={4} className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#BF4BF6] mx-auto"></div></td></tr>
                                    ) : error.technologies ? (
                                        <tr><td colSpan={4} className="text-center py-4 text-red-500">Error loading technologies: {error.technologies}</td></tr>
                                    ) : filteredTechnologies.length === 0 && searchTerm ? (
                                        <tr><td colSpan={4} className="text-center py-4 text-indigo">No technologies found matching search term.</td></tr>
                                    ) : filteredTechnologies.map((technology) => (
                                        <tr
                                            key={technology.id}
                                            className="border-b border-gray-200 hover:bg-[#F6E6FF]/50 transition-all duration-300 card-hover"
                                        >
                                            <td className="px-4 py-3 text-indigo font-medium text-sm">
                                                {technology.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    technology.status === 'active' 
                                                        ? 'bg-green-100 text-green-600 badge-pulse' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {technology.status === 'active' ? 'Active' : t('projectManager.projectCruds.inactive')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-indigo text-sm">
                                                {renderCreatedBy(technology, t)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditTechnology(technology.id)}
                                                        className={`p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-[#BF4BF6] transition-all-300 ${
                                                            technology.creatorType !== 'project_manager' || technology.status !== 'active' 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : ''
                                                        }`}
                                                        disabled={technology.creatorType !== 'project_manager' || technology.status !== 'active'}
                                                        aria-label="Edit technology"
                                                        title={
                                                            technology.creatorType !== 'project_manager'
                                                                ? t('projectManager.projectCruds.adminCreated')
                                                                : technology.status !== 'active'
                                                                ? t('projectManager.projectCruds.inactiveCannotEdit')
                                                                : "Edit technology"
                                                        }
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTechnologyConfirmation(technology.id)}
                                                        className={`p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-red-500 transition-all-300 ${
                                                            technology.creatorType !== 'project_manager' || technology.status !== 'active'
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : ''
                                                        }`}
                                                        disabled={technology.creatorType !== 'project_manager' || technology.status !== 'active'}
                                                        aria-label="Delete technology"
                                                        title={
                                                            technology.creatorType !== 'project_manager'
                                                                ? t('projectManager.projectCruds.adminCreatedDelete')
                                                                : technology.status !== 'active'
                                                                ? t('projectManager.projectCruds.inactiveCannotDelete')
                                                                : "Delete technology"
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTechnologies.length === 0 && !searchTerm && !isLoading.technologies && !error.technologies && (
                                        <tr><td colSpan={4} className="text-center py-8 text-indigo">{t('projectManager.projectCruds.noTechnologiesFound')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : showRoles ? (
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                    <h3 className="text-xl text-russian-violet font-['Unbounded'] mb-4">{t('projectManager.projectCruds.roles')}</h3>
                    <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                        <div className="min-w-[500px] px-3 sm:px-0 sm:min-w-0">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.roleName')}</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">{t('projectManager.projectCruds.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading.roles ? (
                                        <tr><td colSpan={2} className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#BF4BF6] mx-auto"></div></td></tr>
                                    ) : error.roles ? (
                                        <tr><td colSpan={2} className="text-center py-4 text-red-500">Error loading roles: {error.roles}</td></tr>
                                    ) : filteredRoles.length === 0 && searchTerm ? (
                                        <tr><td colSpan={2} className="text-center py-4 text-indigo">No roles found matching search term.</td></tr>
                                    ) : filteredRoles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="border-b border-gray-200 hover:bg-[#F6E6FF]/50 transition-all duration-300 card-hover"
                                        >
                                            <td className="px-4 py-3 text-indigo font-medium text-sm">{role.name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditRole(role.id)}
                                                        className="p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-[#BF4BF6] transition-all-300"
                                                        aria-label="Edit role"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoleConfirmation(role.id)}
                                                        className="p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-red-500 transition-all-300"
                                                        aria-label="Delete role"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRoles.length === 0 && !searchTerm && !isLoading.roles && !error.roles && (
                                        <tr><td colSpan={2} className="text-center py-8 text-indigo">{t('projectManager.projectCruds.noRolesFound')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}

            {showForm && showProjects && (
                <ProjectForm 
                    isOpen={showForm}
                    isEditing={editingId !== null}
                    formData={formData}
                    formErrors={formErrors}
                    selectedTechnologiesDisplay={selectedTechnologiesDisplay}
                    error={error.form}
                    isSubmitting={isSubmitting}
                    availableTechnologies={availableTechnologies}
                    projectRoles={projectRoles}
                    onClose={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                    onSubmit={() => editingId ? handleUpdate() : handleCreate()}
                    onTechnologyChange={handleTechnologyChange}
                    onRoleChange={handleRoleChange}
                    onRoleAmountChange={handleRoleAmountChange}
                    onInputChange={handleFormInputChange}
                    addRoleAssignment={addRoleAssignment}
                    removeRoleAssignment={removeRoleAssignment}
                    removeTechnology={removeTechnology}
                />
            )}

            {isTechnologyFormOpen && (
                <TechnologyForm
                    isOpen={isTechnologyFormOpen}
                    isEditing={editingTechnologyId !== null}
                    formData={technologyFormData}
                    error={error.form}
                    onClose={() => {
                        setIsTechnologyFormOpen(false);
                        setEditingTechnologyId(null);
                        resetTechnologyForm();
                    }}
                    onSubmit={() => editingTechnologyId ? handleUpdateTechnology() : handleCreateTechnology()}
                    onInputChange={(value) => setTechnologyFormData({ name: value })}
                />
            )}

            {showRoleForm && showRoles && !showProjects && !isTechnologySectionActive && (
                <RoleForm
                    isOpen={showRoleForm}
                    isEditing={editingRoleId !== null}
                    formData={roleFormData}
                    formErrors={roleFormErrors}
                    error={error.form}
                    onClose={() => { setShowRoleForm(false); setEditingRoleId(null); resetRoleForm(); }}
                    onSubmit={() => editingRoleId ? handleUpdateRole() : handleCreateRole()}
                    onInputChange={(value) => setRoleFormData({ name: value })}
                />
            )}

            {showDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showDeleteConfirmation}
                    title={t('projectManager.projectCruds.confirmDeleteProject')}
                    message={`${t('projectManager.projectCruds.confirmDeleteMessage')} project? ${t('projectManager.projectCruds.actionCannotBeUndone')}`}
                    onCancel={cancelDeleteProject}
                    onConfirm={confirmDeleteProject}
                />
            )}

            {showTechnologyDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showTechnologyDeleteConfirmation}
                    title={t('projectManager.projectCruds.confirmDeleteTechnology')}
                    message={`${t('projectManager.projectCruds.confirmDeleteMessage')} technology? ${t('projectManager.projectCruds.actionCannotBeUndone')}`}
                    onCancel={cancelDeleteTechnology}
                    onConfirm={confirmDeleteTechnology}
                />
            )}

            {showRoleDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showRoleDeleteConfirmation}
                    title={t('projectManager.projectCruds.confirmDeleteRole')}
                    message={`${t('projectManager.projectCruds.confirmDeleteMessage')} role? ${t('projectManager.projectCruds.actionCannotBeUndone')}`}
                    onCancel={cancelDeleteRole}
                    onConfirm={confirmDeleteRole}
                />
            )}
        </div>
    );
};

export default ProjectCRUD;