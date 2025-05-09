// src/pages/learner/CourseCategories/CourseCategories.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { getCategories } from '../../../api/services/courseCategoryService';
import { PathCard } from './types/PathCard';
import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield
} from 'lucide-react';

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map icon names to React components
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'code': Code2,
      'target': Target,
      'clipboard': ClipboardList,
      'settings': Settings,
      'palette': Palette,
      'chart': LineChart,
      'cloud': Cloud,
      'shield': Shield
    };

    const IconComponent = iconMap[iconName.toLowerCase()] || Code2;
    return <IconComponent size={30} className="text-white" />;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        
        // Convert the categories data to PathCard objects with React icon components
        const pathsWithIcons = categoriesData.map(category => ({
          title: category.title,
          icon: getIconComponent(category.iconName),
          description: category.description,
          totalCourses: category.totalCourses,
          activeUsers: category.activeUsers,
          avgDuration: category.avgDuration
        }));
        
        setPaths(pathsWithIcons);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load course categories');
        toast.error('Failed to load course categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleExplore = (pathTitle: string) => {
    navigate(`/courses/${encodeURIComponent(pathTitle)}`);
  };

  const filteredPaths = paths.filter(path => {
    return path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           path.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          <Header />
          <StatsOverview />
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-white text-center py-10">
              <p className="text-xl">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
              >
                Retry
              </button>
            </div>
          ) : (
            <PathGrid 
              paths={filteredPaths} 
              onExplore={handleExplore} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;