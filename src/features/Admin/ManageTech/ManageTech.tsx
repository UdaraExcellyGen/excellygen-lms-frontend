//src\features\Admin\ManageTech\ManageTech.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Technology, FilterStatus, TechFilters } from './types/technology.types';
import { useTechnologies, filterTechnologies } from './data/technologyData';
import { AddEditTechModal } from './components/AddEditTechModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { TechFilters as TechFiltersComponent } from './components/TechFilters';
import { TechGrid } from './components/TechGrid';

const ManageTech: React.FC = () => {
  const navigate = useNavigate();
  const { currentFirebaseUser } = useAuth();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [techToDelete, setTechToDelete] = useState<string | null>(null);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<TechFilters>({
    searchTerm: '',
    filterStatus: 'all'
  });
  
  // Initialize the technologies hook
  const {
    technologies,
    isLoading,
    error,
    networkError,
    isTechLoading,
    fetchTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology,
    toggleTechnologyStatus
  } = useTechnologies();

  // Check if user is authenticated
  useEffect(() => {
    if (!currentFirebaseUser) {
      console.log('User not authenticated, redirecting to login');
      // You might want to redirect to login or show a message
    }
  }, [currentFirebaseUser]);

  // Handle filters
  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const handleStatusChange = (filterStatus: FilterStatus) => {
    setFilters(prev => ({ ...prev, filterStatus }));
  };

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterStatus: 'all'
    });
  }, []);

  // Modal handlers
  const handleAddEditModalOpen = (tech: Technology | null = null) => {
    setEditingTech(tech);
    setShowAddModal(true);
  };

  const handleAddEditModalClose = () => {
    setShowAddModal(false);
    setEditingTech(null);
  };

  const handleAddEditModalSubmit = async (values: { name: string }) => {
    let success;
    
    if (editingTech) {
      success = await updateTechnology(editingTech.id, values);
    } else {
      success = await createTechnology(values);
    }
    
    if (success) {
      handleAddEditModalClose();
    }
  };

  const handleDeleteModalOpen = (id: string) => {
    setTechToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setTechToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (techToDelete) {
      const success = await deleteTechnology(techToDelete);
      if (success) {
        handleDeleteModalClose();
      }
    }
  };

  // Filter technologies based on the current filters
  const filteredTechnologies = filterTechnologies(technologies, filters);

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
                Technologies Management
              </h1>
              <button
                onClick={() => handleAddEditModalOpen()}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                         hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
                disabled={isLoading}
                aria-label="Add new technology"
              >
                <Plus size={20} />
                Add New Technology
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Network Error message */}
      {networkError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Network Error: Unable to connect to the server. Please check your connection and try again.</span>
          </div>
          <div className="mt-2">
            <button 
              onClick={fetchTechnologies}
              className="bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded text-sm"
              aria-label="Retry connection"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Error message (non-network) */}
      {error && !networkError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <TechFiltersComponent
        filters={filters}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onResetFilters={resetFilters}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Technologies Grid */}
      {!isLoading && !networkError && (
        <TechGrid
          technologies={filteredTechnologies}
          filters={filters}
          isTechLoading={isTechLoading}
          onEdit={handleAddEditModalOpen}
          onDelete={handleDeleteModalOpen}
          onToggleStatus={toggleTechnologyStatus}
          onResetFilters={resetFilters}
        />
      )}

      {/* Add/Edit Modal */}
      <AddEditTechModal
        isOpen={showAddModal}
        onClose={handleAddEditModalClose}
        onSubmit={handleAddEditModalSubmit}
        editingTech={editingTech}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ManageTech;