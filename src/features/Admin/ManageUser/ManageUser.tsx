import React, { useState, useEffect } from 'react';
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
import { User } from './types';
import { promoteToSuperAdmin } from '../../../api/services/userService';
import { toast } from 'react-toastify';

const ManageUser: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const { user: currentUser } = useAuth();
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  const {
    users, // This now returns filtered users directly
    isPageLoading, // Single loading state
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
    // SuperAdmin related
    isSuperAdmin,
    isRegularAdmin,
    canDeleteUser,
    canEditUser,
    formatRoleName,
    getRoleColor,
    handlePromoteToSuperAdmin
  } = useUsers();

  // Function to handle promoting a user to SuperAdmin without auto-logout
  const safePromoteToSuperAdmin = async (userId: string) => {
    const isCurrentUser = userId === currentUser?.id;
    
    if (isCurrentUser) {
      setShowPromotionModal(true);
    } else {
      try {
        setLoadingUserIds(prev => [...prev, userId]);
        
        const token = localStorage.getItem('access_token');
        await promoteToSuperAdmin(userId, token);
        
        toast.success(`User promoted to SuperAdmin successfully`);
      } catch (error) {
        toast.error("Failed to promote user to SuperAdmin");
        console.error(error);
      } finally {
        setLoadingUserIds(prev => prev.filter(id => id !== userId));
      }
    }
  };

  // Reset to first page when users list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterState.selectedRoles, filterState.filterStatus]);

  useEffect(() => {
    console.log('All users:', users);
    console.log('Current user:', currentUser);
  }, [users, currentUser]);
  
  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Generate empty rows if needed to fill the table with 10 rows
  const emptyRows = usersPerPage - currentUsers.length;

  // Render SuperAdmin badge
  const renderSuperAdminBadge = (user: User) => {
    if (user.roles.includes('SuperAdmin')) {
      return (
        <span 
          className="inline-flex items-center px-2 py-0.5 ml-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          title="Super Admin has extended privileges"
        >
          <Shield size={10} className="mr-1" />
          Super Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] font-nunito">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 relative">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-[#D68BF9] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-white">User Management</h1>
            {isSuperAdmin && (
              <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs flex items-center">
                <Shield size={12} className="mr-1" />
                Super Admin
              </span>
            )}
          </div>
          
          <button
            onClick={() => {
              setEditingUser(null);
              setNewUser({ name: '', email: '', phone: '', roles: ['Learner'], department: '', password: '' });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={18} />
            Add New User
          </button>
        </div>

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

        {/* Filter Bar - SIMPLIFIED: Removed isFetchingFilteredData prop */}
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

        {/* Users Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 shadow-lg relative z-[80]">
          {/* SIMPLIFIED Loading state - Only one loading indicator */}
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
                  {currentUsers.map((user, index) => {
                    const isCurrentUser = user.id === currentUser?.id;
                    return (
                      <tr 
                        key={user.id} 
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
                                  {getInitials(user.name)}
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div 
                                className="text-[#1B0A3F] font-semibold cursor-pointer hover:text-[#BF4BF6] transition-colors flex items-center"
                                onClick={() => navigate(`/admin/view-profile/${user.id}`)}
                              >
                                {user.name} {isCurrentUser && <span className="text-[#BF4BF6] text-xs ml-1">(you)</span>}
                                {user.roles.includes('SuperAdmin') && (
                                  <Shield size={14} className="ml-1 text-purple-600" title="Super Admin" />
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
                            {user.roles.map((role, idx) => {
                              return (
                                <span 
                                  key={idx} 
                                  className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)} whitespace-nowrap`}
                                  style={{ 
                                    maxWidth: '110px', 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {role.toLowerCase() === 'superadmin' && <Shield size={10} className="mr-1" />}
                                  {formatRoleName(role)}
                                </span>
                              );
                            })}
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
                            }`} 
                                  title={
                                    isCurrentUser 
                                      ? "You cannot change your own account status" 
                                      : !canEditUser(user)
                                        ? "You don't have permission to change this user's status"
                                        : ""
                                  }>
                              <input 
                                type="checkbox" 
                                checked={user.status === 'active'}
                                onChange={() => canEditUser(user) && !isCurrentUser && handleToggleStatus(user.id)}
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
                              onClick={() => canEditUser(user) && handleEditUser(user)}
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
                              onClick={() => canDeleteUser(user) && handleDeleteUser(user.id)}
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
                              onClick={() => navigate(`/admin/view-profile/${user.id}`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              title="View Profile"
                            >
                              <UserCog size={16} />
                            </button>
                            {isCurrentUser && (
                              <div className="ml-1">
                                <ShieldAlert size={16} className="text-[#BF4BF6]" title="This is your account" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Empty rows to maintain consistent table height */}
                  {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b border-gray-200 h-[72px]">
                      <td colSpan={6} className="px-4 py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isPageLoading && users.length > 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastUser > users.length ? users.length : indexOfLastUser}
                  </span>{" "}
                  of <span className="font-medium">{users.length}</span> users
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

        {/* User statistics summary */}
        {!isPageLoading && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">{users.length}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">
                  {users.filter(user => user.status === 'active').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-[#F6E6FF] text-[#BF4BF6] mr-4">
                <UserX size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inactive Users</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">
                  {users.filter(user => user.status === 'inactive').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#BF4BF6]/20 flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-xl font-semibold text-[#1B0A3F]">
                  {users.filter(user => user.roles.includes('SuperAdmin')).length}
                </p>
              </div>
            </div>
          </div>
        )}
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