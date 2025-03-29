import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, NewUser } from './types';
import { initialUsers } from './data/usersData';
import Header from './components/Header';
import SearchAndFilter from './components/SearchAndFilter';
import UserGrid from './components/UserGrid';
import UserFormModal from './components/UserFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const ManageUser: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // State for form data
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    phone: '',
    roles: ['learner'],
    department: '',
  });

  const handleNavigateBack = () => {
    navigate('/admin/dashboard');
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      roles: ['learner'],
      department: '',
    });
  };

  const handleAddUser = (userData: NewUser) => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...userData }
          : user
      ));
    } else {
      const user: User = {
        id: Date.now().toString(),
        ...userData,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
    }
    handleCloseAddModal();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: [...user.roles],
      department: user.department,
    });
    setShowAddModal(true);
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const toggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole === 'all' || user.roles.includes(filterRole))
  );

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      <Header 
        onNavigateBack={handleNavigateBack} 
        onAddUser={handleOpenAddModal} 
      />
      
      <SearchAndFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
      />
      
      <UserGrid 
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={toggleStatus}
      />
      
      <UserFormModal 
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleAddUser}
        editingUser={editingUser}
        userData={newUser}
        setUserData={setNewUser}
      />
      
      <DeleteConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageUser;