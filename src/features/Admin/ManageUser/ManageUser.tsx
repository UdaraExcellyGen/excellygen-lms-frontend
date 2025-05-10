// ManageUser.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { useUsers } from './data/useUsers';
import UserCard from './components/UserCard';
import FilterBar from './components/FilterBar';
import UserForm from './components/UserForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import TempPasswordDialog from './components/TempPasswordDialog';
import SkeletonLoader from './components/SkeletonLoader';
import { User } from './types';

const ManageUser: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  const {
    users,
    isPageLoading,
    isFetchingFilteredData,
    isSubmitting,
    isDeleting,
    error,
    showAddModal,
    showDeleteModal,
    showTempPasswordModal,
    tempPasswordData,
    setShowTempPasswordModal,
    editingUser,
    newUser,
    filterState,
    debouncedSearchTerm,
    setFilterState,
    handleRoleChange,
    resetFilters,
    setNewUser,
    updateNewUserRoles,
    setEditingUser,
    setShowAddModal,
    setShowDeleteModal,
    setUserToDelete,
    handleAddUser,
    handleToggleStatus,
    confirmDelete,
    resetForm,
    setError,
    isUserLoading
  } = useUsers();

  // Utility functions
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coordinator': 
      case 'course coordinator': 
      case 'course_coordinator': return 'bg-blue-100 text-blue-800';
      case 'learner': return 'bg-green-100 text-green-800';
      case 'project_manager': 
      case 'project manager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatRoleName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'coursecoordinator': 
      case 'coordinator': 
      case 'course coordinator': 
      case 'course_coordinator': 
        return 'Course Coordinator';
      case 'projectmanager': 
      case 'project_manager': 
      case 'project manager': 
        return 'Project Manager';
      case 'learner': 
        return 'Learner';
      case 'admin': 
        return 'Admin';
      default: 
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      roles: [...user.roles],
      department: user.department || '',
      password: '' // Clear password when editing
    });
    setShowAddModal(true);
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-[#F6E6FF] rounded-full transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-[#BF4BF6]" />
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
              <h1 className="text-2xl text-[#1B0A3F] font-['Unbounded']">
                User Management
              </h1>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({ name: '', email: '', phone: '', roles: ['Learner'], department: '', password: '' });
                  setShowAddModal(true);
                }}
                className="px-6 py-3 bg-[#BF4BF6] text-white rounded-full font-['Nunito_Sans'] 
                         hover:bg-[#7A00B8] transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={20} />
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate-fadeIn">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error.includes('already registered') ? 'Duplicate Entry' : 'Error'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator for initial page load only */}
      {isPageLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar 
        filterState={filterState}
        debouncedSearchTerm={debouncedSearchTerm}
        showRoleFilter={showRoleFilter}
        showStatusFilter={showStatusFilter}
        setShowRoleFilter={setShowRoleFilter}
        setShowStatusFilter={setShowStatusFilter}
        setFilterState={setFilterState}
        handleRoleChange={handleRoleChange}
        resetFilters={resetFilters}
        formatRoleName={formatRoleName}
        getRoleColor={getRoleColor}
        isFetchingFilteredData={isFetchingFilteredData}
      />

      {/* Show this message when data is empty and not loading */}
      {!isPageLoading && users.length === 0 && !isFetchingFilteredData && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-fadeIn">
          <p className="text-gray-600 font-['Nunito_Sans']">
            No users found matching your filters. Try adjusting your search criteria.
          </p>
          {(debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') && (
            <button 
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-[#F6E6FF] text-[#BF4BF6] rounded-full font-['Nunito_Sans'] 
                       hover:bg-[#BF4BF6] hover:text-white transition-all duration-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
        {/* Show skeleton loaders while initial data is loading */}
        {isPageLoading && [...Array(6)].map((_, index) => (
          <SkeletonLoader key={`skeleton-${index}`} />
        ))}
        
        {/* User Cards */}
        {!isPageLoading && users.map((user) => (
          <UserCard 
            key={user.id}
            user={user}
            isUserLoading={isUserLoading}
            handleToggleStatus={handleToggleStatus}
            handleDeleteUser={handleDeleteUser}
            formatRoleName={formatRoleName}
            getRoleColor={getRoleColor}
            navigate={navigate}
            onEditUser={handleEditUser}
          />
        ))}
      </div>

      {/* User Form Modal */}
      <UserForm 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingUser={editingUser}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        isSubmitting={isSubmitting}
        updateNewUserRoles={updateNewUserRoles}
        resetForm={resetForm}
        formatRoleName={formatRoleName}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        setUserToDelete={setUserToDelete}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />
      
      {/* Temporary Password Dialog */}
      {tempPasswordData && (
        <TempPasswordDialog
          isOpen={showTempPasswordModal}
          onClose={() => setShowTempPasswordModal(false)}
          userName={tempPasswordData.userName}
          userEmail={tempPasswordData.userEmail}
          tempPassword={tempPasswordData.tempPassword}
        />
      )}
    </div>
  );
};

export default ManageUser;