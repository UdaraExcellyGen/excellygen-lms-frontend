//src\features\Admin\ManageTech\data\technologyData.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import TechnologyService from '../../../../api/services/AdminDashboard/TechnologyService';
import { Technology, TechFormValues, TechFilters } from '../types/technology.types';

// Filter technologies based on search term and status filter
export const filterTechnologies = (
  technologies: Technology[],
  filters: TechFilters
): Technology[] => {
  const { searchTerm, filterStatus } = filters;
  
  return technologies.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
};

// Hook for managing technologies data and operations
export const useTechnologies = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  
  // Loading state for individual technologies during toggle
  const [loadingTechIds, setLoadingTechIds] = useState<string[]>([]);
  
  // Check if a tech is currently loading
  const isTechLoading = useCallback((techId: string) => {
    return loadingTechIds.includes(techId);
  }, [loadingTechIds]);

  // Fetch technologies from API
  const fetchTechnologies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNetworkError(false);
    
    try {
      const data = await TechnologyService.getAllTechnologies();
      setTechnologies(data);
    } catch (err: any) {
      console.error('Error in fetchTechnologies:', err);
      
      // Check if it's a network error
      if (err.message === 'Network Error') {
        setNetworkError(true);
        setError('Unable to connect to the server. Please check your connection and try again.');
        toast.error('Network connection error');
      } else {
        setError('Error loading technologies. Please try again.');
        toast.error(err.message || 'Failed to load technologies');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTechnology = useCallback(async (techData: TechFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await TechnologyService.createTechnology(techData);
      toast.success('Technology added successfully');
      await fetchTechnologies();
      return true;
    } catch (err: any) {
      console.error('Error in createTechnology:', err);
      
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your connection and try again.');
        toast.error('Network connection error');
      } else {
        setError(err.message || 'Error saving technology. Please try again.');
        toast.error(err.message || 'Failed to save technology');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTechnologies]);

  const updateTechnology = useCallback(async (id: string, techData: TechFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await TechnologyService.updateTechnology(id, techData);
      toast.success('Technology updated successfully');
      await fetchTechnologies();
      return true;
    } catch (err: any) {
      console.error('Error in updateTechnology:', err);
      
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your connection and try again.');
        toast.error('Network connection error');
      } else {
        setError(err.message || 'Error updating technology. Please try again.');
        toast.error(err.message || 'Failed to update technology');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTechnologies]);

  const deleteTechnology = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await TechnologyService.deleteTechnology(id);
      toast.success('Technology deleted successfully');
      await fetchTechnologies();
      return true;
    } catch (err: any) {
      console.error('Error in deleteTechnology:', err);
      
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your connection and try again.');
        toast.error('Network connection error');
      } else {
        setError(err.message || 'Error deleting technology. Please try again.');
        toast.error('Failed to delete technology');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTechnologies]);

  const toggleTechnologyStatus = useCallback(async (techId: string) => {
    try {
      // Add this tech ID to loading state
      setLoadingTechIds(prev => [...prev, techId]);
      
      // Proceed with the toggle
      await TechnologyService.toggleTechnologyStatus(techId);
      toast.success('Status updated successfully');
      
      // Refresh the technology list
      await fetchTechnologies();
      return true;
    } catch (err: any) {
      console.error('Error in toggleStatus:', err);
      
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your connection and try again.');
        toast.error('Network connection error');
      } else {
        setError(err.message || 'Error updating technology status. Please try again.');
        toast.error('Failed to update status');
      }
      return false;
    } finally {
      // Remove this tech ID from loading state
      setLoadingTechIds(prev => prev.filter(id => id !== techId));
    }
  }, [fetchTechnologies]);

  // Load technologies on initial mount
  useEffect(() => {
    fetchTechnologies();
  }, [fetchTechnologies]);

  return {
    technologies,
    isLoading,
    error,
    networkError,
    isTechLoading,
    loadingTechIds,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
    toggleTechnologyStatus,
  };
};