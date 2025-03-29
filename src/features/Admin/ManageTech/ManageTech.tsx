import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Technology } from './types/Technology';
import { initialTechnologies } from './data/initialTechnologies';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TechnologyCard from './components/TechnologyCard';
import AddEditTechModal from './components/AddEditTechModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const ManageTech: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [techToDelete, setTechToDelete] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>(initialTechnologies);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTech = (techData: { name: string }) => {
    if (editingTech) {
      setTechnologies(technologies.map(tech => 
        tech.id === editingTech.id 
          ? { ...tech, name: techData.name }
          : tech
      ));
    } else {
      const technology: Technology = {
        id: Date.now().toString(),
        name: techData.name,
        status: 'active'
      };
      setTechnologies([...technologies, technology]);
    }
    setEditingTech(null);
    setShowAddModal(false);
  };

  const handleDeleteTech = (id: string) => {
    setTechToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (techToDelete) {
      setTechnologies(technologies.filter(tech => tech.id !== techToDelete));
      setShowDeleteModal(false);
      setTechToDelete(null);
    }
  };

  const toggleStatus = (techId: string) => {
    setTechnologies(technologies.map(tech => 
      tech.id === techId 
        ? { ...tech, status: tech.status === 'active' ? 'inactive' : 'active' }
        : tech
    ));
  };

  const handleEditTech = (tech: Technology) => {
    setEditingTech(tech);
    setShowAddModal(true);
  };

  const filteredTechnologies = technologies.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#52007C] p-4 sm:p-6 lg:p-8">
      <Header 
        onAddNew={() => setShowAddModal(true)}
        onBack={() => navigate('/admin/dashboard')}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnologies.map((tech) => (
          <TechnologyCard
            key={tech.id}
            technology={tech}
            onEdit={handleEditTech}
            onDelete={handleDeleteTech}
            onToggleStatus={toggleStatus}
          />
        ))}
      </div>

      <AddEditTechModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTech(null);
        }}
        onSave={handleAddTech}
        editingTech={editingTech}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTechToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageTech;