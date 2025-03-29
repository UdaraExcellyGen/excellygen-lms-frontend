import React from 'react';
import { User } from '../types';
import UserCard from './UserCard';

interface UserGridProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const UserGrid: React.FC<UserGridProps> = ({ users, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard 
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default UserGrid;