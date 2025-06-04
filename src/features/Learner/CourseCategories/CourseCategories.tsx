import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview'; 
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
// FIXED: Removed CourseCategoryDtoBackend from import as it's unused
import { getCategories as getCategoriesApi } from '../../../api/services/courseCategoryService'; 
import { PathCard } from './types/PathCard'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService'; 
import { OverallLmsStatsDto } from '../../../types/course.types'; 

import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield
} from 'lucide-react';

// REMOVED: The duplicate local interface CourseCategoryDtoBackend was here. It's now removed.

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setLoading(true);
        // Fetch categories and overall LMS stats concurrently
        const [categoriesData, fetchedOverallStats] = await Promise.all([ 
          getCategoriesApi(), 
          getOverallLmsStatsForLearner() 
        ]);
        
        setOverallLmsStats(fetchedOverallStats); 

        // Map backend data to frontend PathCard format
        const pathsWithIcons: PathCard[] = categoriesData.map(category => {
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
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch categories or overall stats:', err);
        setError(err.response?.data?.message || 'Failed to load course categories or overall statistics.');
        toast.error(err.response?.data?.message || 'Failed to load course categories or overall statistics.');
      } finally {
        setLoading(false);
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
          {/* Pass overall LMS stats to StatsOverview */}
          <StatsOverview 
            totalCoursesOverall={overallLmsStats.totalPublishedCourses} 
            totalActiveLearnersOverall={overallLmsStats.totalActiveLearners} 
          />
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
              onExplore={(pathId) => handleExplore(pathId)} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;