// src/features/Learner/CourseCategories/CourseCategories.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview'; 
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { getCategories as getCategoriesApi, clearCategoriesCache } from '../../../api/services/courseCategoryService'; 
import { PathCard } from './types/PathCard'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService'; 
import { OverallLmsStatsDto } from '../../../types/course.types'; 

import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield, Loader2
} from 'lucide-react';

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallLmsStats, setOverallLmsStats] = useState<OverallLmsStatsDto>({
    totalCategories: 0,
    totalPublishedCourses: 0,
    totalActiveLearners: 0,
    totalActiveCoordinators: 0,
    totalProjectManagers: 0,
    averageCourseDurationOverall: 'N/A'
  });

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'code': Code2, 'target': Target, 'clipboard': ClipboardList, 'settings': Settings,
      'palette': Palette, 'chart': LineChart, 'cloud': Cloud, 'shield': Shield
    };
    const IconComponent = iconMap[iconName.toLowerCase()] || Code2; 
    return <IconComponent size={30} className="text-white" />;
  };

  const fetchCategoriesAndStats = useCallback(async () => { 
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting to fetch categories...');
      
      // Fetch categories first (critical data)
      const categoriesResult = await getCategoriesApi();
      
      const pathsWithIcons: PathCard[] = categoriesResult.map(category => ({
        id: category.id, 
        title: category.title,
        icon: getIconComponent(category.icon), 
        description: category.description,
        totalCourses: category.totalCourses,
        activeUsers: category.activeLearnersCount, 
        avgDuration: category.avgDuration 
      }));
      
      setPaths(pathsWithIcons);
      console.log('Categories loaded successfully:', pathsWithIcons.length);
      
      // Fetch stats after categories (non-critical, don't block UI)
      getOverallLmsStatsForLearner()
        .then(stats => {
          setOverallLmsStats(stats);
        })
        .catch(statsError => {
          console.error('Non-critical error fetching stats:', statsError);
          toast.error('Could not load latest statistics.');
        });
      
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load course categories.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('Category data fetching completed');
    }
  }, []); 

  useEffect(() => {
    // Clear cache only on first mount, then fetch
    clearCategoriesCache();
    fetchCategoriesAndStats();
  }, []); // Simple - only run once

  const handleExplore = useCallback((categoryId: string) => {
    navigate(`/learner/courses/${encodeURIComponent(categoryId)}`); 
  }, [navigate]);

  const handleRetry = useCallback(() => {
    clearCategoriesCache();
    fetchCategoriesAndStats();
  }, [fetchCategoriesAndStats]);

  const filteredPaths = paths.filter(path => {
    return path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           path.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Loading state for just the grid
  const GridLoader: React.FC = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="animate-spin h-12 w-12 text-white" />
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <Header />
          <StatsOverview 
            totalCoursesOverall={overallLmsStats.totalPublishedCourses} 
            totalActiveLearnersOverall={overallLmsStats.totalActiveLearners} 
          />
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          
          {isLoading ? (
            <GridLoader />
          ) : error ? (
            <div className="text-white text-center py-10 bg-red-900/30 rounded-lg">
              <p className="text-xl mb-4">Could not load categories.</p>
              <p className="text-sm text-red-300 mb-6">{error}</p>
              <button 
                onClick={handleRetry} 
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Retry'}
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