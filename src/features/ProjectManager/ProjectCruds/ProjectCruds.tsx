// Path: src/features/ProjectManager/ProjectCruds/ProjectCruds.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Search, Plus, Edit, Trash2,
    Lock, ChevronDown, Menu, X as XIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Import toast for notifications

// Import components
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import ProjectForm from './components/ProjectForm';
import TechnologyForm from './components/TechnologyForm';
import RoleForm from './components/RoleForm';

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
        // Create a date object from the string (works with both ISO format and YYYY-MM-DD)
        const date = new Date(dateString);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original if parsing failed
        }
        
        // Format the date in YYYY-MM-DD format using UTC to avoid timezone shifts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString; // Return original on error
    }
};

const calculateRemainingDays = (deadlineStr: string | null | undefined): number | null => {
    if (!deadlineStr) return null;

    try {
        // Get today's date at midnight in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Create a date object directly from the string (handles both ISO and simple formats)
        // For ISO format with timezone (from backend), this will convert to local time
        let deadlineDate = new Date(deadlineStr);
        
        // Reset the time portion to midnight to ensure we're comparing just dates
        deadlineDate = new Date(
            deadlineDate.getFullYear(),
            deadlineDate.getMonth(),
            deadlineDate.getDate(),
            0, 0, 0, 0
        );

        // Calculate difference in days - using UTC methods to avoid timezone issues
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

const ProjectCRUD: React.FC = () => {
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

    // NEW STATE FOR ROLE FIX
    const [rolesLoaded, setRolesLoaded] = useState(false);
    const [roleNameMap, setRoleNameMap] = useState<{[key: string]: string}>({});

    // Set active view based on current URL
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

    // NEW EFFECT FOR ROLE FIX - Persist role names in localStorage
    useEffect(() => {
        const persistRoleMap = () => {
            if (projectRoles.length > 0) {
                // Create the role map
                const newRoleMap: {[key: string]: string} = {};
                projectRoles.forEach(role => {
                    // Store by string ID
                    newRoleMap[String(role.id)] = role.name;
                    // Also store by numeric ID if possible
                    const numId = parseInt(String(role.id), 10);
                    if (!isNaN(numId)) {
                        newRoleMap[numId] = role.name;
                    }
                });
                
                // Store in component state
                setRoleNameMap(newRoleMap);
                
                // Also persist in localStorage for redundancy
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

    // NEW FUNCTION FOR ROLE FIX - Load role map from localStorage
    const loadPersistedRoleMap = () => {
        try {
            const storedRoleMap = localStorage.getItem('projectRoleNameMap');
            if (storedRoleMap) {
                const parsedMap = JSON.parse(storedRoleMap);
                setRoleNameMap(parsedMap);
                console.log('Loaded role name map from localStorage:', parsedMap);
                return parsedMap;
            }
        } catch (err) {
            console.error('Error loading role map from localStorage:', err);
        }
        return {};
    };

    // Function to update role names in projects
    const updateProjectRoleNames = () => {
        // Only proceed if we have both projects and roles loaded
        if (projects.length === 0 || projectRoles.length === 0) return;
        
        console.log("Updating project role names with available roles:", 
            projectRoles.map(r => ({id: r.id, name: r.name})));
        
        // Create a lookup map for faster role lookups
        const roleMap = {};
        projectRoles.forEach(role => {
            roleMap[String(role.id)] = role.name;
            // Also add numeric key for number IDs
            roleMap[parseInt(String(role.id), 10)] = role.name;
        });
        
        // Update all projects with role names
        const updatedProjects = projects.map(project => {
            if (!project.requiredRoles || project.requiredRoles.length === 0) {
                return project;
            }
            
            // Update roles with names from the map
            const updatedRoles = project.requiredRoles.map(role => {
                const stringId = String(role.roleId);
                const numId = parseInt(stringId, 10);
                
                // Try to find the role name from our map
                let roleName = role.roleName; // Use existing name if present
                
                // If no name yet, try string ID lookup
                if (!roleName && roleMap[stringId]) {
                    roleName = roleMap[stringId];
                }
                
                // If still no name and ID is numeric, try numeric lookup
                if (!roleName && !isNaN(numId) && roleMap[numId]) {
                    roleName = roleMap[numId];
                }
                
                // If still no name, use generic "Role X" format
                if (!roleName) {
                    roleName = `Role ${role.roleId}`;
                    console.log(`Could not find name for role ID ${role.roleId} in roleMap:`, roleMap);
                }
                
                return {
                    ...role,
                    roleName
                };
            });
            
            return {
                ...project,
                requiredRoles: updatedRoles
            };
        });
        
        setProjects(updatedProjects);
    };

    // Fetch functions - MODIFIED FOR ROLE FIX
    const fetchRoles = async () => {
        console.log("Starting role fetch...");
        setIsLoading((prev) => ({ ...prev, roles: true }));
        setError((prev) => ({ ...prev, roles: null }));
        
        // Load persisted role map first for immediate use
        const persistedRoleMap = loadPersistedRoleMap();
        
        try {
            const roles = await getAllRoles();
            console.log("Fetched roles:", roles);
            
            // Create a new lookup map
            const newRoleMap: {[key: string]: string} = {};
            roles.forEach(role => {
                // Store by string ID
                newRoleMap[String(role.id)] = role.name;
                // Also store by numeric ID
                const numId = parseInt(String(role.id), 10);
                if (!isNaN(numId)) {
                    newRoleMap[numId] = role.name;
                }
            });
            
            console.log("Created role map:", newRoleMap);
            setRoleNameMap({...persistedRoleMap, ...newRoleMap});
            setProjectRoles(roles);
            setRolesLoaded(true);
            
            // Persist to localStorage
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

    // MODIFIED FOR ROLE FIX
    const fetchProjects = async () => {
        console.log("Starting project fetch with role map:", roleNameMap);
        setIsLoading((prev) => ({ ...prev, projects: true }));
        setError((prev) => ({ ...prev, projects: null }));
        
        try {
            const fetchedProjects = await getAllProjects(
                projectStatusFilter !== 'All' ? projectStatusFilter : undefined
            );
            console.log("Fetched projects:", fetchedProjects);
            
            // Enhance projects with role names using our roleNameMap
            const enhancedProjects = fetchedProjects.map(project => {
                if (project.requiredRoles && project.requiredRoles.length > 0) {
                    const rolesWithNames = project.requiredRoles.map(role => {
                        // Get the string roleId
                        const roleId = String(role.roleId);
                        
                        // Look up the name in our role map - try string ID first
                        let roleName = roleNameMap[roleId];
                        
                        // If that fails, try numeric ID
                        if (!roleName) {
                            const numId = parseInt(roleId, 10);
                            if (!isNaN(numId)) {
                                roleName = roleNameMap[numId];
                            }
                        }
                        
                        // If we still don't have a name, use the original name or a fallback
                        if (!roleName) {
                            roleName = role.roleName || `Role ${role.roleId}`;
                            console.log(`Warning: Unable to find role name for ID ${roleId} in role map:`, roleNameMap);
                        }
                        
                        return {
                            ...role,
                            roleName: roleName
                        };
                    });
                    
                    return {
                        ...project,
                        requiredRoles: rolesWithNames
                    };
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

    // Main data loading effect with proper sequencing - MODIFIED FOR ROLE FIX
    useEffect(() => {
        const loadData = async () => {
            try {
                // Clear the rolesLoaded flag at the start
                setRolesLoaded(false);
                console.log("=== Starting data loading sequence ===");
                
                // Set loading flags
                setIsLoading({
                    projects: true,
                    technologies: true,
                    roles: true
                });
                
                // First load roles as a separate step
                await fetchRoles();
                console.log("Roles loaded and processed");
                
                // Then load technologies
                await fetchTechnologies();
                console.log("Technologies loaded");
                
                // Wait a moment to ensure state updates are processed
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Finally load projects which depends on roles being available
                await fetchProjects();
                console.log("Projects loaded and processed");
                
            } catch (err) {
                console.error("Error in load sequence:", err);
            } finally {
                setIsLoading({
                    projects: false,
                    technologies: false,
                    roles: false
                });
                console.log("=== Data loading sequence complete ===");
            }
        };
        
        loadData();
    }, [projectStatusFilter]);

    // Additional effect to update projects when roles change
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

    // Project Management Functions - MODIFIED FOR ROLE FIX
    const handleCreate = async () => {
        setIsLoading((prev) => ({ ...prev, projects: true }));
        
        // Prevent multiple submissions
        if (isSubmittingRef.current) {
            return;
        }
        
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
            
            // Enhance the new project with role names from our role map
            const enhancedProject = {
                ...newProject,
                requiredRoles: newProject.requiredRoles?.map(role => {
                    const roleId = String(role.roleId);
                    let roleName = roleNameMap[roleId];
                    
                    if (!roleName) {
                        const numId = parseInt(roleId, 10);
                        if (!isNaN(numId)) {
                            roleName = roleNameMap[numId];
                        }
                    }
                    
                    if (!roleName) {
                        // Use the original roleName if it exists, otherwise try to find in projectRoles
                        const foundRole = projectRoles.find(r => String(r.id) === roleId || 
                            parseInt(String(r.id), 10) === parseInt(roleId, 10));
                        
                        roleName = foundRole?.name || role.roleName || `Role ${role.roleId}`;
                    }
                    
                    return {
                        ...role,
                        roleName: roleName
                    };
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
            // Reset submission state after a delay
            setTimeout(() => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }, 500);
        }
    };

    // MODIFIED FOR ROLE FIX
    const handleUpdate = async () => {
        if (!editingId) return;
        
        setIsLoading((prev) => ({ ...prev, projects: true }));
        
        // Prevent multiple submissions
        if (isSubmittingRef.current) {
            return;
        }
        
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
            
            // Enhance the updated project with role names using our role map
            const enhancedProject = {
                ...updatedProject,
                requiredRoles: updatedProject.requiredRoles?.map(role => {
                    const roleId = String(role.roleId);
                    let roleName = roleNameMap[roleId];
                    
                    if (!roleName) {
                        const numId = parseInt(roleId, 10);
                        if (!isNaN(numId)) {
                            roleName = roleNameMap[numId];
                        }
                    }
                    
                    if (!roleName) {
                        // Use the original roleName if it exists, otherwise try to find in projectRoles
                        const foundRole = projectRoles.find(r => String(r.id) === roleId || 
                            parseInt(String(r.id), 10) === parseInt(roleId, 10));
                        
                        roleName = foundRole?.name || role.roleName || `Role ${role.roleId}`;
                    }
                    
                    return {
                        ...role,
                        roleName: roleName
                    };
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
            // Reset submission state after a delay
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

    // Technology Management Functions
    const handleCreateTechnology = async () => {
        setError((prev) => ({ ...prev, form: null }));
        if (!technologyFormData.name.trim()) {
            setError((prev) => ({ ...prev, form: "Technology name is required" }));
            return;
        }
        
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        try {
            const newTechnology = await createTechnology({ name: technologyFormData.name.trim() });
            
            // Add the new technology to both local lists
            setEmployeeTechnologies([...employeeTechnologies, newTechnology]);
            setAvailableTechnologies([...availableTechnologies, newTechnology]);
            
            setIsTechnologyFormOpen(false);
            resetTechnologyForm();
            toast.success("Technology created successfully");
        } catch (err: any) {
            // Check if it's a permission error
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
            
            // Check if it's admin-created
            if (technology?.creatorType === 'admin') {
                setError((prev) => ({ ...prev, form: "Admin-created technologies cannot be modified" }));
                toast.error("Admin-created technologies cannot be modified");
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            
            // Check if it's inactive
            if (technology?.status !== 'active') {
                setError((prev) => ({ ...prev, form: "Inactive technologies cannot be modified" }));
                toast.error("Inactive technologies cannot be modified");
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            
            const updatedTechnology = await updateTechnology(
                editingTechnologyId.toString(), 
                { name: technologyFormData.name.trim() }
            );
            
            // Update both local lists with the updated technology
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
            // Check if it's a permission error
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

    const handleDeleteTechnologyConfirmation = (id: number | string) => {
        const technology = employeeTechnologies.find((tech) => tech.id === id);
        if (technology) {
            // Check if technology is admin-created or inactive
            if (technology.creatorType === 'admin') {
                toast.error("Admin-created technologies cannot be deleted");
                return;
            }
            
            if (technology.status !== 'active') {
                toast.error("Inactive technologies cannot be deleted");
                return;
            }
            
            setTechnologyIdToDelete(id);
            setShowTechnologyDeleteConfirmation(true);
        }
    };

    const confirmDeleteTechnology = async () => {
        if (!technologyIdToDelete) return;
        
        setIsLoading((prev) => ({ ...prev, technologies: true }));
        try {
            const technology = employeeTechnologies.find(tech => tech.id === technologyIdToDelete);
            
            // Final check before deletion
            if (technology?.creatorType === 'admin') {
                setError((prev) => ({ ...prev, technologies: "Admin-created technologies cannot be deleted" }));
                toast.error("Admin-created technologies cannot be deleted");
                setShowTechnologyDeleteConfirmation(false);
                setTechnologyIdToDelete(null);
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            
            if (technology?.status !== 'active') {
                setError((prev) => ({ ...prev, technologies: "Inactive technologies cannot be deleted" }));
                toast.error("Inactive technologies cannot be deleted");
                setShowTechnologyDeleteConfirmation(false);
                setTechnologyIdToDelete(null);
                setIsLoading((prev) => ({ ...prev, technologies: false }));
                return;
            }
            
            await deleteTechnology(technologyIdToDelete.toString());
            
            // Remove the technology from local lists
            setEmployeeTechnologies(employeeTechnologies.filter(tech => tech.id !== technologyIdToDelete));
            setAvailableTechnologies(availableTechnologies.filter(tech => tech.id !== technologyIdToDelete));
            
            setShowTechnologyDeleteConfirmation(false);
            setTechnologyIdToDelete(null);
            toast.success("Technology deleted successfully");
        } catch (err: any) {
            console.error('Error in deleteTechnology:', err);
            
            // Handle different error cases
            if (err.response?.status === 403) {
                setError((prev) => ({ ...prev, technologies: "You need Admin privileges to manage technologies" }));
                toast.error("Admin privileges required to manage technologies");
            } else if (err.response?.status === 400 && err.response?.data?.includes("in use")) {
                setError((prev) => ({ ...prev, technologies: "Cannot delete technology that is in use by projects" }));
                toast.error("Cannot delete technology that is in use by projects");
            } else {
                setError((prev) => ({ ...prev, technologies: err.message || "Error deleting technology" }));
                toast.error(err.message || "Error deleting technology");
            }
        } finally {
            setIsLoading((prev) => ({ ...prev, technologies: false }));
        }
    };

    const cancelDeleteTechnology = () => {
        setShowTechnologyDeleteConfirmation(false);
        setTechnologyIdToDelete(null);
    };

    // Role Management Functions
    const handleCreateRole = async () => {
        setError((prev) => ({ ...prev, form: null }));
        if (!validateRoleForm()) {
            setError((prev) => ({ ...prev, form: "Please fill in the role name" }));
            return;
        }
        setIsLoading((prev) => ({ ...prev, roles: true }));
        try {
            const createRoleData: CreateRoleRequest = {
                name: roleFormData.name.trim()
            };
            
            const newRole = await createRole(createRoleData);
            setProjectRoles([...projectRoles, newRole]);
            setShowRoleForm(false);
            resetRoleForm();
            toast.success("Role created successfully");
            
            // Refresh projects to update any roles
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
            const updateRoleData: UpdateRoleRequest = {
                name: roleFormData.name.trim()
            };
            
            const updatedRole = await updateRole(editingRoleId.toString(), updateRoleData);
            
            setProjectRoles(projectRoles.map(role => 
                role.id === editingRoleId ? updatedRole : role
            ));
            
            setShowRoleForm(false);
            setEditingRoleId(null);
            resetRoleForm();
            toast.success("Role updated successfully");
            
            // Refresh projects to update any roles
            fetchProjects();
        } catch (err: any) {
            setError((prev) => ({ ...prev, form: err.message || "Error updating role" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    const handleDeleteRoleConfirmation = (id: number | string) => {
        setRoleIdToDelete(id);
        setShowRoleDeleteConfirmation(true);
    };

    const confirmDeleteRole = async () => {
        if (!roleIdToDelete) return;
        
        setIsLoading((prev) => ({ ...prev, roles: true }));
        try {
            await deleteRole(roleIdToDelete.toString());
            setProjectRoles(projectRoles.filter(role => role.id !== roleIdToDelete));
            setShowRoleDeleteConfirmation(false);
            setRoleIdToDelete(null);
            toast.success("Role deleted successfully");
            
            // Refresh projects to update any roles
            fetchProjects();
        } catch (err: any) {
            setError((prev) => ({ ...prev, roles: err.message || "Error deleting role" }));
        } finally {
            setIsLoading((prev) => ({ ...prev, roles: false }));
        }
    };

    const cancelDeleteRole = () => {
        setShowRoleDeleteConfirmation(false);
        setRoleIdToDelete(null);
    };

    // Reset Form Functions
    const resetForm = () => {
        setFormData({
            name: "",
            status: "Active",
            deadline: "",
            description: "",
            shortDescription: "",
            requiredTechnologies: [],
            progress: 0,
            startDate: "",
            assignedRoles: [],
        });
        setSelectedTechnologiesDisplay([]);
        setFormErrors({
            name: false,
            deadline: false,
            startDate: false
        });
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

    // Edit Functions - MODIFIED FOR ROLE FIX
    const startEdit = async (id: number | string) => {
        try {
            const project = await getProjectById(id.toString());
            if (project) {
                // Format dates for form input with improved handling of timezone
                const formatDateForInput = (dateString: string | null | undefined) => {
                    if (!dateString) return '';
                    try {
                        const date = new Date(dateString);
                        
                        // Check if the date is valid
                        if (isNaN(date.getTime())) {
                            return ''; // Return empty string if parsing failed
                        }
                        
                        // Format as YYYY-MM-DD for input field
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        
                        return `${year}-${month}-${day}`;
                    } catch (error) {
                        console.error("Error formatting date for input:", error);
                        return '';
                    }
                };

                // Handle required technologies
                const requiredTechnologiesObjects = (project.requiredSkills || []).map((tech) => ({
                    id: tech.id,
                    name: tech.name
                }));

                const selectedTechnologies = requiredTechnologiesObjects.map((tech) => tech.name);

                // Prepare role assignments - with improved role name lookup
                let assignedRoles: { roleId: number | string, roleName: string, amount: number }[] = [];

                if (project.requiredRoles && project.requiredRoles.length > 0) {
                    console.log("Project requiredRoles:", project.requiredRoles);
                    
                    assignedRoles = project.requiredRoles.map((role) => {
                        // Get role name with better fallback
                        const roleId = String(role.roleId);
                        
                        // Use our role map first
                        let roleName = roleNameMap[roleId];
                        
                        if (!roleName) {
                            const numId = parseInt(roleId, 10);
                            if (!isNaN(numId)) {
                                roleName = roleNameMap[numId];
                            }
                        }
                        
                        if (!roleName) {
                            // Try to find the role
                            const foundRole = projectRoles.find(r => 
                                String(r.id) === roleId || 
                                (!isNaN(parseInt(roleId, 10)) && parseInt(String(r.id), 10) === parseInt(roleId, 10))
                            );
                            
                            roleName = role.roleName || (foundRole ? foundRole.name : `Role ${role.roleId}`);
                        }
                        
                        console.log(`Role ${roleId} mapped to name: ${roleName}`);
                        
                        return {
                            roleId: role.roleId, // Ensure we're using the actual ID value
                            roleName: roleName,
                            amount: role.count
                        };
                    });
                }

                console.log("Setting form with assignedRoles:", assignedRoles);

                setFormData({
                    name: project.name || '',
                    status: project.status || 'Active',
                    deadline: formatDateForInput(project.deadline),
                    description: project.description || '',
                    shortDescription: project.shortDescription || '',
                    requiredTechnologies: requiredTechnologiesObjects,
                    progress: project.progress || 0,
                    startDate: formatDateForInput(project.startDate),
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
            // Check if technology is admin-created or inactive
            if (technology.creatorType === 'admin') {
                toast.error("Admin-created technologies cannot be edited");
                return;
            }
            
            if (technology.status !== 'active') {
                toast.error("Inactive technologies cannot be edited");
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

    // Form Change Handlers - MODIFIED FOR ROLE FIX
    const handleTechnologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTechnologyNames = Array.from(e.target.selectedOptions, (option) => option.value);

        const selectedTechnologyObjects = availableTechnologies
            .filter((tech) => selectedTechnologyNames.includes(tech.name))
            .map((tech) => ({
                id: tech.id,
                name: tech.name
            }));

        setFormData((prevFormData) => ({
            ...prevFormData,
            requiredTechnologies: selectedTechnologyObjects
        }));

        setSelectedTechnologiesDisplay(selectedTechnologyNames);
    };

    // MODIFIED FOR ROLE FIX
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
        const roleId = e.target.value;
        
        // Get role name from map or project roles
        let roleName = roleNameMap[roleId];
        
        if (!roleName) {
            // If not in map, try to find in projectRoles
            const foundRole = projectRoles.find(r => String(r.id) === roleId);
            roleName = foundRole?.name || `Role ${roleId}`;
        }
        
        console.log(`Role selected: ID=${roleId}, Name=${roleName}`);

        setFormData((prevFormData) => {
            const updatedRoles = [...prevFormData.assignedRoles];
            updatedRoles[index] = { ...updatedRoles[index], roleId, roleName };
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
            ...prevFormData,
            requiredTechnologies: updatedTechs
        }));
        setSelectedTechnologiesDisplay(updatedTechs.map((t) => t.name));
    };

    const handleFormInputChange = (field: string, value: string | number) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: value
        }));
        
        if (field === 'name' || field === 'deadline' || field === 'startDate') {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [field]: false
            }));
        }
    };

    const validateRoleForm = () => {
        const errors = {
            name: !roleFormData.name.trim(),
        };
        setRoleFormErrors(errors);
        return !Object.values(errors).some((error) => error);
    };

    // Filtered data for displays
    const filteredProjects = projects.filter((project) => {
        const searchLower = searchTerm.toLowerCase();
        // Only search by name
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

    // Navigation
    const toggleSection = (section: 'projects' | 'technologies' | 'roles') => {
        if (section === 'projects') {
            navigate('/project-manager/project-cruds');
        } else if (section === 'technologies') {
            navigate('/project-manager/project-cruds/technologies');
        } else if (section === 'roles') {
            navigate('/project-manager/project-cruds/roles');
        }
        setMobileMenuOpen(false); // Close menu after selection on mobile
    };

    return (
        <div className="min-h-screen bg-[#52007C] p-2 sm:p-4 md:p-6 lg:p-8 font-['Nunito_Sans']">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6">
                <div className="p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-4">                        <button
                            onClick={() => navigate('/project-manager/dashboard')}
                            className="p-2 hover:bg-pale-purple rounded-full transition-all duration-300"
                           title="Go back to dashboard" 
                            aria-label="Go back to dashboard"
                        > 
                            <ArrowLeft size={20} className="text-[#BF4BF6]" />
                        </button>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-2 md:gap-4">
                            <h1 className="text-lg md:text-2xl font-['Unbounded'] text-gradient truncate">
                                {showProjects ? 'Project Management' :
                                    isTechnologySectionActive ? 'Technology Management' :
                                        showRoles ? 'Role Management' : 'Management Dashboard'}
                            </h1>
                            
                            {/* Mobile menu toggle */}
                            <div className="sm:hidden ml-auto">
                                <button 
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-[#52007C] hover:bg-[#F6E6FF] rounded-full"
                                >
                                    {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                            
                            {/* Desktop nav */}
                            <div className="hidden sm:flex flex-wrap gap-2">
                                <button
                                    onClick={() => toggleSection('projects')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${showProjects ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    Projects
                                </button>
                                <button
                                    onClick={() => toggleSection('technologies')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${isTechnologySectionActive ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    Technologies
                                </button>
                                <button
                                    onClick={() => toggleSection('roles')}
                                    className={`px-4 py-2 rounded-full transition-all duration-300 ${showRoles ? 'bg-gradient-primary text-white shadow-soft' : 'bg-[#F6E6FF] text-[#1B0A3F] hover:bg-pale-purple'}`}
                                >
                                    Roles
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile nav menu */}
                    {mobileMenuOpen && (
                        <div className="sm:hidden mt-4 flex flex-col space-y-2 bg-[#F6E6FF] p-3 rounded-xl animate-modalEnter">
                            <button
                                onClick={() => toggleSection('projects')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${showProjects ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                Projects
                            </button>
                            <button
                                onClick={() => toggleSection('technologies')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${isTechnologySectionActive ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                Technologies
                            </button>
                            <button
                                onClick={() => toggleSection('roles')}
                                className={`px-4 py-3 rounded-lg transition-all duration-300 text-left ${showRoles ? 'bg-gradient-primary text-white shadow-soft' : 'bg-white text-[#1B0A3F] hover:bg-pale-purple'}`}
                            >
                                Roles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading/Error Indicators */}
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

            {/* Search and Actions Bar */}
            <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6 p-4 md:p-6">
                {showProjects ? (
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
                        <div className="relative w-full md:w-auto md:flex-grow md:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <button
                                    className="w-full sm:w-auto px-4 py-2 bg-white rounded-lg border border-gray-200 text-[#1B0A3F] hover:bg-pale-purple transition-all duration-300 focus-ring flex items-center justify-between"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                >
                                    <span>{projectStatusFilter} Statuses</span>
                                    <ChevronDown size={16} className="ml-2" />
                                </button>

                                {isStatusDropdownOpen && (
                                    <div className="fixed inset-0 z-[9999]" onClick={() => setIsStatusDropdownOpen(false)}>
                                        <div
                                            className="absolute bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-modalEnter w-full max-w-[200px] sm:w-auto"
                                            style={{
                                                top: document.querySelector('[data-status-dropdown]')?.getBoundingClientRect().bottom + window.scrollY + 5 || 0,
                                                left: document.querySelector('[data-status-dropdown]')?.getBoundingClientRect().left + window.scrollX || 0,
                                                width: (document.querySelector('[data-status-dropdown]') as HTMLElement)?.offsetWidth || 200
                                            }}
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
                                                    {status} Statuses
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
                                <span className="whitespace-nowrap">Add Project</span>
                            </button>
                        </div>
                    </div>
                ) : isTechnologySectionActive ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:flex-grow sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search technologies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>
                        
                        <select
                            value={techStatusFilter}
                            onChange={(e) => setTechStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        
                        <button
                            onClick={() => {
                                setIsTechnologyFormOpen(true);
                                setEditingTechnologyId(null);
                                resetTechnologyForm();
                            }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-full hover:bg-pale-purple transition-all duration-300 flex items-center justify-center gap-2 shadow-soft"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">Add Technology</span>
                        </button>
                    </div>
                ) : showRoles ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:flex-grow sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 py-2 border border-gray-200 rounded-lg focus-ring focus:outline-none focus:ring-2 focus:ring-[#BF4BF6] transition-all duration-200"
                            />
                        </div>
                        <button
                            onClick={() => { setShowRoleForm(true); setEditingRoleId(null); resetRoleForm(); }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-primary text-white rounded-full hover:bg-pale-purple transition-all duration-300 flex items-center justify-center gap-2 shadow-soft"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">Add Role</span>
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Main Content Area */}
            {showProjects ? (
                <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 md:p-6">
                    {/* MODIFIED FOR ROLE FIX - Updated loading state display */}
                    {isLoading.projects || !rolesLoaded ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BF4BF6]"></div>
                            <p className="ml-2 text-indigo">
                                {!rolesLoaded ? "Loading roles..." : "Loading projects..."}
                            </p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-8 text-indigo">
                            No projects found. Create your first project!
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                            <div className="min-w-[768px] px-3 sm:px-0 sm:min-w-0">
                                <table className="w-full border-separate border-spacing-0">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Name</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Status</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Deadline</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm hidden md:table-cell">Technologies</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm hidden lg:table-cell">Roles</th>
                                            <th className="px-2 sm:px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Actions</th>
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
                                                        {project.status}
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
                                                                        {remainingDays < 0 
                                                                            ? `${Math.abs(remainingDays)} days overdue` 
                                                                            : remainingDays === 0 
                                                                                ? 'Due today' 
                                                                                : `${remainingDays} days left`}
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
                                                                // Improved role name lookup - MODIFIED FOR ROLE FIX
                                                                const roleId = String(role.roleId); // Ensure string comparison
                                                                
                                                                // Use our role map first
                                                                let roleName = roleNameMap[roleId];
                                                                
                                                                if (!roleName) {
                                                                    const numId = parseInt(roleId, 10);
                                                                    if (!isNaN(numId)) {
                                                                        roleName = roleNameMap[numId];
                                                                    }
                                                                }
                                                                
                                                                // If not in map, try to use existing name
                                                                if (!roleName) {
                                                                    roleName = role.roleName;
                                                                }
                                                                
                                                                // If still no name, try to find in projectRoles
                                                                if (!roleName) {
                                                                    const foundRole = projectRoles.find(r => 
                                                                        String(r.id) === roleId || 
                                                                        (!isNaN(parseInt(roleId, 10)) && 
                                                                         parseInt(String(r.id), 10) === parseInt(roleId, 10)));
                                                                    if (foundRole) {
                                                                        roleName = foundRole.name;
                                                                    }
                                                                }
                                                                
                                                                // If we still don't have a name, use the ID
                                                                if (!roleName) {
                                                                    roleName = `Role ${roleId}`;
                                                                    console.log(`Unable to find name for role ID ${roleId}`);
                                                                }
                                                                
                                                                return (
                                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                                        <span className="font-bold mr-1">{role.count}×</span> {roleName}
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
                    <h3 className="text-xl text-russian-violet font-['Unbounded'] mb-4">Employee Technologies</h3>
                    <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                        <div className="min-w-[500px] px-3 sm:px-0 sm:min-w-0">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Technology Name</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Status</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Created By</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Actions</th>
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
                                            <td className="px-4 py-3 text-indigo font-medium text-sm">{technology.name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    technology.status === 'active' 
                                                        ? 'bg-green-100 text-green-600 badge-pulse' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {technology.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-indigo text-sm">
                                                {technology.creatorType === 'admin' ? (
                                                    <span className="flex items-center text-gray-600">
                                                        <Lock size={12} className="mr-1" /> Admin
                                                    </span>
                                                ) : (
                                                    'Project Manager'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditTechnology(technology.id)}
                                                        className={`p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-[#BF4BF6] transition-all-300 ${
                                                            technology.creatorType === 'admin' || technology.status !== 'active' 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : ''
                                                        }`}
                                                        disabled={technology.creatorType === 'admin' || technology.status !== 'active'}
                                                        aria-label="Edit technology"
                                                        title={
                                                            technology.creatorType === 'admin' 
                                                                ? "Admin-created technologies cannot be edited" 
                                                                : technology.status !== 'active'
                                                                ? "Inactive technologies cannot be edited"
                                                                : "Edit technology"
                                                        }
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTechnologyConfirmation(technology.id)}
                                                        className={`p-2 rounded-full hover:bg-pale-purple text-indigo hover:text-red-500 transition-all-300 ${
                                                            technology.creatorType === 'admin' || technology.status !== 'active'
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : ''
                                                        }`}
                                                        disabled={technology.creatorType === 'admin' || technology.status !== 'active'}
                                                        aria-label="Delete technology"
                                                        title={
                                                            technology.creatorType === 'admin' 
                                                                ? "Admin-created technologies cannot be deleted" 
                                                                : technology.status !== 'active'
                                                                ? "Inactive technologies cannot be deleted"
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
                                        <tr><td colSpan={4} className="text-center py-8 text-indigo">No technologies found. Add your first technology!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : showRoles ? (
                <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
                    <h3 className="text-xl text-russian-violet font-['Unbounded'] mb-4">Project Roles</h3>
                    <div className="overflow-x-auto custom-scrollbar -mx-3 sm:mx-0">
                        <div className="min-w-[500px] px-3 sm:px-0 sm:min-w-0">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Role Name</th>
                                        <th className="px-4 py-3 text-left text-russian-violet font-medium border-b-3 border-[#F6E6FF] text-sm">Actions</th>
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
                                        <tr><td colSpan={2} className="text-center py-8 text-indigo">No roles found. Add your first role!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Forms and Dialogs */}
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

            {/* Delete Confirmation Dialogs */}
            {showDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showDeleteConfirmation}
                    title="Confirm Delete Project"
                    message="Are you sure you want to delete this project? This action cannot be undone."
                    onCancel={cancelDeleteProject}
                    onConfirm={confirmDeleteProject}
                />
            )}

            {showTechnologyDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showTechnologyDeleteConfirmation}
                    title="Confirm Delete Technology"
                    message="Are you sure you want to delete this technology? This action cannot be undone."
                    onCancel={cancelDeleteTechnology}
                    onConfirm={confirmDeleteTechnology}
                />
            )}

            {showRoleDeleteConfirmation && (
                <DeleteConfirmationDialog
                    isOpen={showRoleDeleteConfirmation}
                    title="Confirm Delete Role"
                    message="Are you sure you want to delete this role? This action cannot be undone."
                    onCancel={cancelDeleteRole}
                    onConfirm={confirmDeleteRole}
                />
            )}
        </div>
    );
};

export default ProjectCRUD;