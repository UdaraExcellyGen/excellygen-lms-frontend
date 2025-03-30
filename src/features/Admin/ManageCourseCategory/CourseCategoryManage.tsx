import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from './types/Category';
import { initialCategories } from './data/initialCategories';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryCard from './components/CategoryCard';
import AddEditCategoryModal from './components/AddEditCategoryModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const CourseCategoryManage: React.FC = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddCategory = (categoryData: { title: string; description: string; icon: string }) => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, title: categoryData.title, description: categoryData.description, icon: categoryData.icon }
          : cat
      ));
    } else {
      const category: Category = {
        id: Date.now().toString(),
        ...categoryData,
        totalCourses: 0,
        status: 'active'
      };
      setCategories([...categories, category]);
    }
    setEditingCategory(null);
    setShowAddModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(cat => cat.id !== categoryToDelete));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const toggleStatus = (categoryId: string) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, status: cat.status === 'active' ? 'inactive' : 'active' }
        : cat
    ));
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onToggleStatus={toggleStatus}
          />
        ))}
      </div>

      <AddEditCategoryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }}
        onSave={handleAddCategory}
        editingCategory={editingCategory}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CourseCategoryManage;