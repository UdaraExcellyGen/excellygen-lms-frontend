import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview'; 
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { getCategories as getCategoriesApi } from '../../../api/services/courseCategoryService'; 
import { PathCard } from './types/PathCard'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService'; 
import { OverallLmsStatsDto } from '../../../types/course.types'; 

import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield
} from 'lucide-react';

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  // FIXED: Remove local loading state to prevent conflicts with global loading
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track if data is loaded
  const [overallLmsStats, setOverallLmsStats] = useState<OverallLmsStatsDto>({
    totalCategories: 0,
    totalPublishedCourses: 0,
    totalActiveLearners: 0,
    totalActiveCoordinators: 0,
    totalProjectManagers: 0,
    averageCourseDurationOverall: 'N/A'
  });

  // Map icon names (strings from backend) to React components (for frontend display)
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
    const fetchCategoriesAndStats = async () => { 
      try {
        // FIXED: Don't set loading state here, let global loading handle it
        console.log('Starting to fetch categories and stats...');
        
        // OPTIMIZATION: Use Promise.allSettled instead of Promise.all to handle partial failures
        const [categoriesResult, statsResult] = await Promise.allSettled([
          getCategoriesApi(), 
          getOverallLmsStatsForLearner() 
        ]);
        
        // Handle categories result
        if (categoriesResult.status === 'fulfilled') {
          // Map backend data to frontend PathCard format
          const pathsWithIcons: PathCard[] = categoriesResult.value.map(category => {
            return {
              id: category.id, 
              title: category.title,
              icon: getIconComponent(category.icon), 
              description: category.description,
              totalCourses: category.totalCourses,
              activeUsers: category.activeLearnersCount, 
              avgDuration: category.avgDuration 
            };
          });
          
          setPaths(pathsWithIcons);
          console.log('Categories loaded successfully:', pathsWithIcons.length);
        } else {
          console.error('Failed to fetch categories:', categoriesResult.reason);
          throw categoriesResult.reason;
        }

        // Handle stats result
        if (statsResult.status === 'fulfilled') {
          setOverallLmsStats(statsResult.value);
          console.log('Stats loaded successfully');
        } else {
          console.error('Failed to fetch stats:', statsResult.reason);
          // Don't throw error for stats failure, use default values
          toast.error('Could not load statistics, but categories are available');
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load course categories.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        // FIXED: Use isInitialized instead of loading to track completion
        setIsInitialized(true);
        console.log('Data fetching completed');
      }
    };

    fetchCategoriesAndStats();
  }, []); 

  // handleExplore navigates using the actual category ID
  const handleExplore = (categoryId: string) => {
    navigate(`/learner/courses/${encodeURIComponent(categoryId)}`); 
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
          
          {/* FIXED: Only show content after initialization and no error */}
          {isInitialized && !error && (
            <>
              {/* Pass overall LMS stats to StatsOverview */}
              <StatsOverview 
                totalCoursesOverall={overallLmsStats.totalPublishedCourses} 
                totalActiveLearnersOverall={overallLmsStats.totalActiveLearners} 
              />
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
              <PathGrid 
                paths={filteredPaths} 
                onExplore={(pathId) => handleExplore(pathId)} 
              />
            </>
          )}
          
          {/* FIXED: Show error state only after initialization */}
          {isInitialized && error && (
            <div className="text-white text-center py-10">
              <p className="text-xl">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* FIXED: Show minimal loading state only when not initialized */}
          {!isInitialized && !error && (
            <div className="text-white text-center py-10">
              <p className="text-lg">Loading course categories...</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;