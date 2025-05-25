// src/pages/learner/CourseCategories/CourseCategories.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview'; // Import CourseCategories' own StatsOverview
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { getCategories as getCategoriesApi, CourseCategoryDtoBackend } from '../../../api/services/courseCategoryService'; 
import { PathCard } from './types/PathCard'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/learnerOverallStatsService'; // Import the new service
import { OverallLmsStatsDto as OverallLmsStatsBackendDto } from '../../../types/course.types'; // Import its DTO

import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield
} from 'lucide-react';

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallLmsStats, setOverallLmsStats] = useState<OverallLmsStatsBackendDto | null>(null); // State for overall LMS stats


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
    const fetchCategoriesAndStats = async () => { // Renamed function for clarity
      try {
        setLoading(true);
        // Fetch categories and overall LMS stats concurrently
        const [categoriesData, overallStats] = await Promise.all([
          getCategoriesApi(), 
          getOverallLmsStatsForLearner() // Fetch overall LMS stats
        ]);
        
        setOverallLmsStats(overallStats); // Store overall LMS stats

        // Map backend data to frontend PathCard format
        const pathsWithIcons: PathCard[] = categoriesData.map(category => {
          return {
            id: category.id, 
            title: category.title,
            icon: getIconComponent(category.icon), 
            description: category.description,
            totalCourses: category.totalCourses,
            activeUsers: category.activeLearnersCount, // DYNAMIC: Get from backend DTO
            avgDuration: category.avgDuration // DYNAMIC: Get from backend DTO
          };
        });
        
        setPaths(pathsWithIcons);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch categories or overall stats:', err);
        setError(err.response?.data?.message || 'Failed to load course categories or overall statistics.');
        toast.error(err.response?.data?.message || 'Failed to load course categories or overall statistics.');
        // If overallStats fetch fails (e.g., 403 for Learner), it should not block category display.
        // The default values (0 or N/A) in overallLmsStats will handle this gracefully.
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
            totalCoursesOverall={overallLmsStats?.totalPublishedCourses || 0} // DYNAMIC: Pass total published courses
            totalActiveLearnersOverall={overallLmsStats?.totalActiveLearners || 0} // DYNAMIC: Pass total active learners
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
              onExplore={(pathId) => handleExplore(pathId)} // Pass path.id (category ID) to the handler
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;