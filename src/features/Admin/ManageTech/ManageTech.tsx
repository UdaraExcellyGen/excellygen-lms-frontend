import React, { useState, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, Plus, X, AlertCircle, Zap,
  Pencil, Trash2, Check, ChevronLeft, ChevronRight, Search 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Technology, FilterStatus, TechFilters } from './types/technology.types';
import { useTechnologies, filterTechnologies } from './data/technologyData';
import { AddEditTechModal } from './components/AddEditTechModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';

const ManageTech: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const techsPerPage = 10;
  
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
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      // You might want to redirect to login or show a message
    }
  }, [user]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchTerm, filters.filterStatus]);

  // Handle filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
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

  // Pagination calculations
  const indexOfLastTech = currentPage * techsPerPage;
  const indexOfFirstTech = indexOfLastTech - techsPerPage;
  const currentTechs = filteredTechnologies.slice(indexOfFirstTech, indexOfLastTech);
  const totalPages = Math.ceil(filteredTechnologies.length / techsPerPage);

  // Calculate empty rows for consistent table height
  const emptyRows = techsPerPage - currentTechs.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-6 relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Technology Management</h1>
          </div>
          
          <button
            onClick={() => handleAddEditModalOpen()}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            disabled={isLoading}
          >
            <Plus size={18} />
            Add New Technology
          </button>
        </div>

        {/* Error Message */}
        {(error || networkError) && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-xl animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {networkError ? 'Network Error' : 'Error'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{networkError ? 'Unable to connect to the server. Please check your connection and try again.' : error}</p>
                </div>
                {networkError && (
                  <div className="mt-3">
                    <button 
                      onClick={fetchTechnologies}
                      className="bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded text-sm"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => {/* Clear error */}}
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 shadow-lg relative z-[90]">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={handleSearchChange}
                placeholder="Search technologies..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#BF4BF6] focus:border-[#BF4BF6] text-gray-900 bg-white"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
                <select
                  value={filters.filterStatus}
                  onChange={(e) => handleStatusChange(e.target.value as FilterStatus)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] min-w-[120px]"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <button
                onClick={resetFilters}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
                disabled={!filters.searchTerm && filters.filterStatus === 'all'}
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Technologies Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg relative z-[80]">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div>
              <p className="text-[#52007C] text-lg">Loading technologies...</p>
            </div>
          ) : filteredTechnologies.length === 0 ? (
            <div className="p-8 text-center">
              <Zap size={48} className="text-[#BF4BF6] mx-auto mb-4" />
              <p className="text-[#52007C] text-lg mb-2">
                {filters.searchTerm || filters.filterStatus !== 'all'
                  ? 'No technologies match your search criteria.'
                  : 'No technologies found. Add your first technology!'}
              </p>
              {(filters.searchTerm || filters.filterStatus !== 'all') && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-full transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-[#F6E6FF]">
                    <th className="w-1/3 px-6 py-4 text-left text-[#52007C] font-semibold">Technology</th>
                    <th className="w-1/4 px-6 py-4 text-left text-[#52007C] font-semibold">Created Date</th>
                    <th className="w-1/4 px-6 py-4 text-left text-[#52007C] font-semibold">Status</th>
                    <th className="w-1/6 px-6 py-4 text-center text-[#52007C] font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTechs.map((tech, index) => (
                    <tr 
                      key={tech.id} 
                      className={`border-b border-gray-200 hover:bg-[#F6E6FF]/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'}`}
                    >
                      {/* Technology Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 mr-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#52007C] to-[#BF4BF6] flex items-center justify-center text-white text-lg font-bold shadow-md">
                              {tech.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[#1B0A3F] font-semibold text-base">
                              {tech.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Created Date Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-700">
                            {(() => {
                              // Get the date from the backend
                              const utcDate = new Date(tech.createdAt);
                              
                              // Convert to Sri Lanka time by adding the offset (UTC+5:30)
                              const sriLankaTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                              
                              // Format as M/D/YYYY
                              const month = sriLankaTime.getMonth() + 1;
                              const day = sriLankaTime.getDate();
                              const year = sriLankaTime.getFullYear();
                              
                              return `${month}/${day}/${year}`;
                            })()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              // Get the date from the backend
                              const utcDate = new Date(tech.createdAt);
                              
                              // Convert to Sri Lanka time by adding the offset (UTC+5:30)
                              const sriLankaTime = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                              
                              // Format time as h:mm AM/PM
                              let hours = sriLankaTime.getHours();
                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              hours = hours % 12;
                              hours = hours ? hours : 12; // the hour '0' should be '12'
                              
                              const minutes = sriLankaTime.getMinutes().toString().padStart(2, '0');
                              
                              return `${hours}:${minutes} ${ampm}`;
                            })()}
                          </div>
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-3
                            ${tech.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={tech.status === 'active'}
                              onChange={() => toggleTechnologyStatus(tech.id)}
                              className="sr-only peer"
                              disabled={isTechLoading(tech.id)}
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                                peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                                after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                                after:h-5 after:w-5 ${isTechLoading(tech.id) ? 'after:animate-pulse' : 'after:transition-all'} 
                                peer-checked:bg-[#BF4BF6] shadow-inner`}></div>
                          </label>
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleAddEditModalOpen(tech)}
                            className="p-2.5 text-[#BF4BF6] hover:bg-[#F6E6FF] rounded-full transition-colors"
                            disabled={isTechLoading(tech.id)}
                            title="Edit Technology"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteModalOpen(tech.id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            disabled={isTechLoading(tech.id)}
                            title="Delete Technology"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty rows to maintain consistent table height */}
                  {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b border-gray-200 h-[76px]">
                      <td colSpan={4} className="px-6 py-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && filteredTechnologies.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-medium">{indexOfFirstTech + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastTech > filteredTechnologies.length ? filteredTechnologies.length : indexOfLastTech}
                  </span>{" "}
                  of <span className="font-medium">{filteredTechnologies.length}</span> technologies
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm 
                            ${currentPage === 1 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-[#BF4BF6] border border-[#BF4BF6]/30 hover:bg-[#F6E6FF]'}`}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm 
                            ${currentPage === totalPages 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-white text-[#BF4BF6] border border-[#BF4BF6]/30 hover:bg-[#F6E6FF]'}`}
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Technology statistics summary */}
        {!isLoading && filteredTechnologies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Technologies</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">{technologies.length}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <Check size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Technologies</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">
                  {technologies.filter(tech => tech.status === 'active').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <X size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inactive Technologies</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">
                  {technologies.filter(tech => tech.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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