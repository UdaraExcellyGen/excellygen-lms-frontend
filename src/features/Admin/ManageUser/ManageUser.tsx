// src/features/Admin/ManageUsers/ManageUser.tsx
// ENTERPRISE OPTIMIZED: Instant loading, professional UX, optimistic updates
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, ArrowLeft, AlertCircle, Mail, Phone, Building2, 
  Pencil, Trash2, ShieldAlert, ChevronLeft, ChevronRight, Users, 
  UserCheck, UserX, UserCog, Shield
} from 'lucide-react';
import { useUsers } from './data/useUsers';
import FilterBar from './components/FilterBar';
import UserForm from './components/UserForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import TempPasswordDialog from './components/TempPasswordDialog';
import { useAuth } from '../../../contexts/AuthContext';
import { ManageUserSkeleton } from './components/UserSkeletons';
import { emitUserStatusChanged, emitUserCreated, emitUserDeleted } from '../../../utils/dashboardEvents';

// ENTERPRISE: Memoized user row component for optimal performance
const UserTableRow: React.FC<{
  user: any;
  index: number;
  currentUserId?: string;
  isUserLoading: (id: string) => boolean;
  handleToggleStatus: (id: string) => Promise<void>;
  handleDeleteUser: (id: string) => void;
  handleEditUser: (user: any) => void;
  canEditUser: (user: any) => boolean;
  canDeleteUser: (user: any) => boolean;
  formatRoleName: (role: string) => string;
  getRoleColor: (role: string) => string;
  navigate: (path: string) => void;
  sortedRoles: string[];
}> = React.memo(({ 
  user, 
  index, 
  currentUserId, 
  isUserLoading, 
  handleToggleStatus, 
  handleDeleteUser, 
  handleEditUser, 
  canEditUser, 
  canDeleteUser, 
  formatRoleName, 
  getRoleColor, 
  navigate,
  sortedRoles
}) => {
  const isCurrentUser = user.id === currentUserId;

  // ENTERPRISE: Memoized handlers for performance
  const handleStatusToggle = useCallback(() => {
    if (canEditUser(user) && !isCurrentUser) {
      handleToggleStatus(user.id);
    }
  }, [user, canEditUser, isCurrentUser, handleToggleStatus]);

  const handleEdit = useCallback(() => {
    if (canEditUser(user)) {
      handleEditUser(user);
    }
  }, [user, canEditUser, handleEditUser]);

  const handleDelete = useCallback(() => {
    if (canDeleteUser(user)) {
      handleDeleteUser(user.id);
    }
  }, [user, canDeleteUser, handleDeleteUser]);

  const handleViewProfile = useCallback(() => {
    navigate(`/admin/view-profile/${user.id}`);
  }, [user.id, navigate]);

  // ENTERPRISE: Memoized initials calculation
  const userInitials = useMemo(() => {
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }, [user.name]);

  return (
    <tr 
      className={`border-b border-gray-200 hover:bg-[#F6E6FF]/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/80'} ${
        isCurrentUser ? 'border-l-4 border-l-[#BF4BF6]' : 
        user.roles.includes('SuperAdmin') ? 'border-l-4 border-l-purple-500' : ''
      }`}
    >
      {/* User Column */}
      <td className="px-3 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar ? (
              <img 
                src={user.avatar}
                alt={`${user.name}'s avatar`}
                className={`h-10 w-10 rounded-full object-cover border-2 ${
                  user.roles.includes('SuperAdmin') ? 'border-purple-500' : 'border-[#BF4BF6]'
                }`}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                user.roles.includes('SuperAdmin') 
                  ? 'bg-gradient-to-br from-purple-700 to-purple-500' 
                  : 'bg-gradient-to-br from-[#52007C] to-[#BF4BF6]'
              }`}>
                {userInitials}
              </div>
            )}
          </div>
          <div className="ml-3">
            <div 
              className="text-[#1B0A3F] font-semibold cursor-pointer hover:text-[#BF4BF6] transition-colors flex items-center"
              onClick={handleViewProfile}
            >
              {user.name} {isCurrentUser && <span className="text-[#BF4BF6] text-xs ml-1">(you)</span>}
              {user.roles.includes('SuperAdmin') && (
                <Shield size={14} className="ml-1 text-purple-600" />
              )}
            </div>
            <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]">ID: {user.id}</div>
          </div>
        </div>
      </td>
      
      {/* Contact Column */}
      <td className="px-3 py-3">
        <div className="flex flex-col">
          <div className="flex items-center text-sm">
            <Mail size={14} className="text-[#BF4BF6] mr-2" />
            <span className="text-gray-700 truncate max-w-[150px]">{user.email}</span>
          </div>
          <div className="flex items-center text-sm mt-1">
            <Phone size={14} className="text-[#BF4BF6] mr-2" />
            <span className="text-gray-700">{user.phone || "—"}</span>
          </div>
        </div>
      </td>
      
      {/* Roles Column */}
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-2" style={{ minWidth: '240px' }}>
          {sortedRoles.map((role, idx) => (
            <span 
              key={idx} 
              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)} whitespace-nowrap`}
            >
              {role.toLowerCase() === 'superadmin' && <Shield size={10} className="mr-1" />}
              {formatRoleName(role)}
            </span>
          ))}
        </div>
      </td>
      
      {/* Department Column */}
      <td className="px-3 py-3">
        <div className="flex items-center text-sm">
          <Building2 size={14} className="text-[#BF4BF6] mr-2" />
          <span className="text-gray-700">{user.department || "—"}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Joined: {new Date(user.joinedDate).toLocaleDateString()}
        </div>
      </td>
      
      {/* Status Column */}
      <td className="px-3 py-3">
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2
            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </span>
          <label className={`relative inline-flex items-center ${
            isCurrentUser || !canEditUser(user) 
              ? 'cursor-not-allowed opacity-70' 
              : 'cursor-pointer'
          }`}>
            <input 
              type="checkbox" 
              checked={user.status === 'active'}
              onChange={handleStatusToggle}
              className="sr-only peer"
              disabled={isUserLoading(user.id) || isCurrentUser || !canEditUser(user)}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full 
                after:h-5 after:w-5 ${isUserLoading(user.id) ? 'after:animate-pulse' : 'after:transition-all'} 
                peer-checked:bg-[#BF4BF6] shadow-inner`}></div>
          </label>
        </div>
      </td>
      
      {/* Actions Column */}
      <td className="px-3 py-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleEdit}
            className={`p-2 rounded-full transition-colors ${
              canEditUser(user)
                ? 'text-[#BF4BF6] hover:bg-[#F6E6FF]' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={isUserLoading(user.id) || !canEditUser(user)}
            title={
              canEditUser(user) 
                ? "Edit User" 
                : "You don't have permission to edit this user"
            }
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-full transition-colors ${
              canDeleteUser(user)
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
            disabled={isUserLoading(user.id) || !canDeleteUser(user)}
            title={
              isCurrentUser 
                ? "You cannot delete your own account" 
                : !canDeleteUser(user)
                  ? "You don't have permission to delete this user"
                  : "Delete User"
            }
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleViewProfile}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="View Profile"
          >
            <UserCog size={16} />
          </button>
          {isCurrentUser && (
            <div className="ml-1">
              <ShieldAlert size={16} className="text-[#BF4BF6]" />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

UserTableRow.displayName = 'UserTableRow';

// ENTERPRISE: Main component optimized for instant loading
const ManageUser: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const { user: currentUser } = useAuth();
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const {
    users,
    isPageLoading,
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
    handleSubmitUser,
    handleToggleStatus,
    handleDeleteUser,
    handleEditUser,
    confirmDelete,
    resetForm,
    setError,
    isUserLoading,
    generateTempPassword,
    setGenerateTempPassword,
    isSuperAdmin,
    canDeleteUser,
    canEditUser,
    formatRoleName,
    getRoleColor,
  } = useUsers();

  // ENTERPRISE: Memoized role ordering for performance
  const roleOrder = useMemo(() => ['learner', 'coursecoordinator', 'projectmanager', 'admin', 'superadmin'], []);
  
  const normalizeRoleForSort = useCallback((role: string): string => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('course')) return 'coursecoordinator';
    if (lowerRole.includes('project')) return 'projectmanager';
    return lowerRole;
  }, []);

  // ENTERPRISE: Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus]);

  // ENTERPRISE: Memoized pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);
    const emptyRows = usersPerPage - currentUsers.length;

    return {
      indexOfLastUser,
      indexOfFirstUser,
      currentUsers,
      totalPages,
      emptyRows
    };
  }, [users, currentPage, usersPerPage]);

  // ENTERPRISE: Memoized user statistics
  const userStats = useMemo(() => ({
    total: users.length,
    active: users.filter(user => user.status === 'active').length,
    inactive: users.filter(user => user.status === 'inactive').length,
    superAdmins: users.filter(user => user.roles.includes('SuperAdmin')).length
  }), [users]);

  // ENTERPRISE: Memoized initials function
  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  // ENTERPRISE: Memoized handlers
  const handleAddNewUser = useCallback(() => {
    setEditingUser(null);
    setNewUser({ name: '', email: '', phone: '', roles: ['Learner'], department: '', password: '' });
    setShowAddModal(true);
  }, [setEditingUser, setNewUser, setShowAddModal]);

  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentPage(prev => {
      if (direction === 'prev') {
        return Math.max(prev - 1, 1);
      } else {
        return Math.min(prev + 1, paginationData.totalPages);
      }
    });
  }, [paginationData.totalPages]);

  // ENTERPRISE: Show skeleton during initial load
  if (!isPageLoading === false && users.length === 0 && !error) {
    return <ManageUserSkeleton />;
  }

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
            <h1 className="text-3xl font-bold text-white font-['Unbounded']">User Management</h1>
            {isSuperAdmin && (
              <span className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm flex items-center ml-4">
                <Shield size={14} className="mr-1.5" />
                Super Admin
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddNewUser}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={20} />
            Add New User
          </button>
        </div>

        {/* ENTERPRISE: User statistics with optimized rendering */}
        {!isPageLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-[#1B0A3F]">{userStats.total}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-[#1B0A3F]">{userStats.active}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <UserX size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inactive Users</p>
                <p className="text-2xl font-semibold text-[#1B0A3F]">{userStats.inactive}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center shadow-lg">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-2xl font-semibold text-[#1B0A3F]">{userStats.superAdmins}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-xl animate-fadeIn">
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

        {/* Filter Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-6 md:p-8 border border-[#BF4BF6]/20 shadow-lg relative z-[90]">
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
            isSuperAdmin={isSuperAdmin}
          />
        </div>

        {/* ENTERPRISE: Users Table with optimized rendering */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg relative z-[80]">
          {isPageLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF4BF6] mb-4"></div>
              <p className="text-[#52007C] text-lg">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="text-[#BF4BF6] mx-auto mb-4" />
              <p className="text-[#52007C] text-lg mb-2">
                {debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users found. Add your first user!'}
              </p>
              {(debouncedSearchTerm || filterState.selectedRoles.length > 0 || filterState.filterStatus !== 'all') && (
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
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F6E6FF]">
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[15%]">User</th>
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[18%]">Contact</th>
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[30%]">Roles</th>
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[17%]">Department</th>
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[10%]">Status</th>
                    <th className="px-3 py-3 text-left text-[#52007C] font-semibold w-[10%]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginationData.currentUsers.map((user, index) => {
                    // ENTERPRISE: Direct role sorting (no hooks inside map)
                    const sortedRoles = [...user.roles].sort((a, b) => {
                      const normalizedA = normalizeRoleForSort(a);
                      const normalizedB = normalizeRoleForSort(b);
                      const indexA = roleOrder.indexOf(normalizedA);
                      const indexB = roleOrder.indexOf(normalizedB);
                      
                      if (indexA === -1) return 1;
                      if (indexB === -1) return -1;
                      
                      return indexA - indexB;
                    });

                    return (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        index={index}
                        currentUserId={currentUser?.id}
                        isUserLoading={isUserLoading}
                        handleToggleStatus={handleToggleStatus}
                        handleDeleteUser={handleDeleteUser}
                        handleEditUser={handleEditUser}
                        canEditUser={canEditUser}
                        canDeleteUser={canDeleteUser}
                        formatRoleName={formatRoleName}
                        getRoleColor={getRoleColor}
                        navigate={navigate}
                        sortedRoles={sortedRoles}
                      />
                    );
                  })}
                  
                  {/* Empty rows to maintain consistent table height */}
                  {paginationData.emptyRows > 0 && Array.from({ length: paginationData.emptyRows }).map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b border-gray-200 h-[72px]">
                      <td colSpan={6} className="px-4 py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* ENTERPRISE: Optimized Pagination */}
          {!isPageLoading && users.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-medium">{paginationData.indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {paginationData.indexOfLastUser > users.length ? users.length : paginationData.indexOfLastUser}
                  </span>{" "}
                  of <span className="font-medium">{users.length}</span> users
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange('prev')}
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
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === paginationData.totalPages}
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm 
                            ${currentPage === paginationData.totalPages 
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

      {/* User Form Modal */}
      <UserForm 
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingUser={editingUser}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleSubmitUser}
        isSubmitting={isSubmitting}
        updateNewUserRoles={updateNewUserRoles}
        resetForm={resetForm}
        formatRoleName={formatRoleName}
        generateTempPassword={generateTempPassword}
        setGenerateTempPassword={setGenerateTempPassword}
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
      {tempPasswordData && showTempPasswordModal && (
        <TempPasswordDialog
          isOpen={showTempPasswordModal}
          onClose={() => setShowTempPasswordModal(false)}
          userName={tempPasswordData.userName}
          userEmail={tempPasswordData.userEmail}
          tempPassword={tempPasswordData.tempPassword}
          userId={tempPasswordData.userId}
        />
      )}

      {/* SuperAdmin Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-3">SuperAdmin Promotion</h3>
            <p className="mb-4">
              You cannot promote yourself to SuperAdmin while logged in. Please follow these steps:
            </p>
            <ol className="list-decimal pl-5 mb-4 space-y-2">
              <li>Log out of your current session</li>
              <li>Log in as another SuperAdmin user</li>
              <li>Promote your account to SuperAdmin</li>
              <li>Log back in with your account</li>
            </ol>
            <p className="mb-4 text-sm text-gray-600">
              This prevents token validation issues that would automatically log you out.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPromotionModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;