import React, { useState, useCallback, useEffect } from 'react';
import { 
  ArrowLeft, Plus, X, AlertCircle, Cpu,
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
  const [showStatusFilter, setShowStatusFilter] = useState(false);

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
    setShowStatusFilter(false);
  };

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
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 mr-2 text-[#D68BF9] hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white font-['Unbounded']">Technology Management</h1>
          </div>
          
          <button
            onClick={() => handleAddEditModalOpen()}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            disabled={isLoading}
          >
            <Plus size={20} />
            Add New Technology
          </button>
        </div>

        {/* Technology statistics summary */}
        {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pt-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
                <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                    <Cpu size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Technologies</p>
                    <p className="text-2xl font-semibold text-[#1B0A3F]">{technologies.length}</p>
                </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
                <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                    <Check size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Active Technologies</p>
                    <p className="text-2xl font-semibold text-[#1B0A3F]">
                    {technologies.filter(tech => tech.status === 'active').length}
                    </p>
                </div>
                </div>
                
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
                <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                    <X size={24} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Inactive Technologies</p>
                    <p className="text-2xl font-semibold text-[#1B0A3F]">
                    {technologies.filter(tech => tech.status === 'inactive').length}
                    </p>
                </div>
                </div>
            </div>
        )}

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
            <div className="grid md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF4BF6] w-5 h-5" />
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search technologies..."
                        className="w-full p-3 pl-10 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6]"
                    />
                </div>
                <div className="relative md:col-span-1">
                    <button
                        onClick={() => setShowStatusFilter(!showStatusFilter)}
                        className="w-full p-3 rounded-lg bg-[#F6E6FF]/50 text-[#52007C] border border-[#BF4BF6]/30 focus:outline-none focus:ring-1 focus:ring-[#BF4BF6] focus:border-[#BF4BF6] flex justify-between items-center"
                    >
                        <span>
                            {filters.filterStatus === 'all' ? 'All Statuses' : `Status: ${filters.filterStatus.charAt(0).toUpperCase() + filters.filterStatus.slice(1)}`}
                        </span>
                        <svg className="fill-current h-4 w-4 text-[#BF4BF6]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </button>
                    {showStatusFilter && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="py-1">
                                <div onClick={() => handleStatusChange('all')} className="px-3 py-2 cursor-pointer hover:bg-gray-100">All Statuses</div>
                                <div onClick={() => handleStatusChange('active')} className="px-3 py-2 cursor-pointer hover:bg-gray-100">Active</div>
                                <div onClick={() => handleStatusChange('inactive')} className="px-3 py-2 cursor-pointer hover:bg-gray-100">Inactive</div>
                            </div>
                        </div>
                    )}
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
              <Cpu size={48} className="text-[#BF4BF6] mx-auto mb-4" />
              <p className="text-[#52007C] text-lg mb-2">
                {filters.searchTerm || filters.filterStatus !== 'all'
                  ? 'No technologies match your search criteria.'
                  : 'No technologies found. Add your first technology!'}
              </p>
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
                            {new Date(tech.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(tech.createdAt).toLocaleTimeString()}
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