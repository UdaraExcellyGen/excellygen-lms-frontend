// src/features/Learner/CourseCategories/CourseCategories.tsx
// ENTERPRISE OPTIMIZED: Instant loading with enrollment filtering restored
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview'; 
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { getCategoriesWithEnrollmentFilter, clearCategoriesCache } from '../../../api/services/courseCategoryService'; 
import { PathCard } from './types/PathCard'; 
import { getOverallLmsStatsForLearner } from '../../../api/services/LearnerDashboard/learnerOverallStatsService'; 
import { OverallLmsStatsDto } from '../../../types/course.types'; 

import {
  Code2, Target, ClipboardList, Settings, Palette, LineChart, Cloud, Shield, 
  Loader2, BookOpen, Users, Clock, AlertCircle, RefreshCw, X
} from 'lucide-react';

// ENTERPRISE: Skeleton components for instant loading experience
const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white/85 backdrop-blur-md rounded-xl p-6 border border-[#BF4BF6]/20 animate-pulse">
    <div className="flex items-center">
      <div className="w-16 h-16 bg-gray-200 rounded-xl mr-5"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const PathCardSkeleton: React.FC = () => (
  <div className="bg-white/90 backdrop-blur-md rounded-xl overflow-hidden border border-[#BF4BF6]/20 h-full flex flex-col animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6 flex-1 flex flex-col space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="mt-auto space-y-3">
        <div className="flex gap-3">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

const PathGridSkeleton: React.FC = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array(6).fill(0).map((_, index) => (
      <PathCardSkeleton key={index} />
    ))}
  </div>
);

// ENTERPRISE: Optimized icon mapping with memoization
const IconMap = {
  'code': Code2, 'code2': Code2,
  'target': Target,
  'clipboard': ClipboardList, 'clipboardlist': ClipboardList,
  'settings': Settings,
  'palette': Palette,
  'chart': LineChart, 'linechart': LineChart,
  'cloud': Cloud,
  'shield': Shield,
  'database': Code2, // Fallback mapping
  'bookopentext': Code2, // Fallback mapping
  'booktext': Code2 // Fallback mapping
} as const;

// ENTERPRISE: Optimized icon component generator
const getIconComponent = (iconName: string): React.ReactNode => {
  const normalizedName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const IconComponent = IconMap[normalizedName as keyof typeof IconMap] || Code2;
  return <IconComponent size={30} className="text-white" />;
};

// ENTERPRISE: Main component with instant loading and enrollment filtering
const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [paths, setPaths] = useState<PathCard[]>([]);
  
  // ENTERPRISE: Replace blocking loading with instant display
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [statsLoadComplete, setStatsLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const [overallLmsStats, setOverallLmsStats] = useState<OverallLmsStatsDto>({
    totalCategories: 0,
    totalPublishedCourses: 0,
    totalActiveLearners: 0,
    totalActiveCoordinators: 0,
    totalProjectManagers: 0,
    averageCourseDurationOverall: 'N/A'
  });

  // ENTERPRISE: Enhanced data fetching with enrollment filtering
  const fetchCategoriesAndStats = useCallback(async () => {
    try {
      setError(null);
      console.log('🔄 Starting to fetch filtered categories and stats in parallel...');
      
      // ENTERPRISE: Fetch filtered categories and stats in parallel
      const [categoriesResult, statsResult] = await Promise.allSettled([
        getCategoriesWithEnrollmentFilter(), // RESTORED: Use enrollment filtering
        getOverallLmsStatsForLearner()
      ]);
      
      // ENTERPRISE: Handle categories result
      if (categoriesResult.status === 'fulfilled') {
        const pathsWithIcons: PathCard[] = categoriesResult.value.map(category => ({
          id: category.id, 
          title: category.title,
          icon: getIconComponent(category.icon), 
          description: category.description,
          totalCourses: category.totalCourses,
          activeUsers: category.activeLearnersCount, 
          avgDuration: category.avgDuration 
        }));
        
        setPaths(pathsWithIcons);
        setInitialLoadComplete(true);
        console.log('✅ Filtered categories loaded successfully:', pathsWithIcons.length);
      } else {
        throw categoriesResult.reason;
      }
      
      // ENTERPRISE: Handle stats result (non-blocking)
      if (statsResult.status === 'fulfilled') {
        setOverallLmsStats(statsResult.value);
        setStatsLoadComplete(true);
        console.log('✅ Stats loaded successfully');
      } else {
        console.error('Non-critical error fetching stats:', statsResult.reason);
        // Still mark as complete to show default stats
        setStatsLoadComplete(true);
      }
      
    } catch (err: any) {
      console.error('Failed to fetch filtered categories:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load course categories.';
      setError(errorMessage);
      toast.error(errorMessage);
      setInitialLoadComplete(true);
      setStatsLoadComplete(true);
    }
  }, []); 

  useEffect(() => {
    // ENTERPRISE: Clear cache and fetch filtered categories on mount
    clearCategoriesCache();
    fetchCategoriesAndStats();
  }, [fetchCategoriesAndStats]);

  // ENTERPRISE: Optimized navigation with memoization
  const handleExplore = useCallback((categoryId: string) => {
    navigate(`/learner/courses/${encodeURIComponent(categoryId)}`); 
  }, [navigate]);

  // ENTERPRISE: Optimistic retry with loading state
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setStatsLoadComplete(false);
    clearCategoriesCache(); // This now clears the filtered cache too
    
    try {
      await fetchCategoriesAndStats();
      toast.success('Categories refreshed successfully!');
    } catch (err) {
      // Error already handled in fetchCategoriesAndStats
    } finally {
      setIsRetrying(false);
    }
  }, [fetchCategoriesAndStats]);

  // ENTERPRISE: Optimized search with debouncing through useMemo
  const filteredPaths = useMemo(() => {
    if (!searchQuery.trim()) return paths;
    
    const query = searchQuery.toLowerCase();
    return paths.filter(path => {
      return path.title.toLowerCase().includes(query) ||
             path.description.toLowerCase().includes(query);
    });
  }, [paths, searchQuery]);

  // ENTERPRISE: Memoized search handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          
          {/* Header - Always visible */}
          <Header />
          
          {/* ENTERPRISE: Professional error display */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0"/>
              <div className="flex-1">
                <p className="font-medium">Failed to load categories</p>
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button 
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </>
                )}
              </button>
              <button 
                onClick={handleClearError}
                className="text-red-300 hover:text-white ml-2"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          {/* ENTERPRISE: Stats with dedicated loading state for instant display */}
          {!statsLoadComplete ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          ) : (
            <StatsOverview 
              totalCoursesOverall={overallLmsStats.totalPublishedCourses} 
              totalActiveLearnersOverall={overallLmsStats.totalActiveLearners} 
            />
          )}
          
          {/* Search Bar - Always visible */}
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={handleSearchChange} 
          />
          
          {/* ENTERPRISE: Instant content display with skeleton loading */}
          <div className="min-h-[400px]">
            {!initialLoadComplete ? (
              <PathGridSkeleton />
            ) : filteredPaths.length === 0 && !error ? (
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 text-center border border-[#BF4BF6]/20 shadow-lg">
                <BookOpen size={48} className="text-[#BF4BF6] mx-auto mb-4" />
                <h3 className="text-xl text-[#52007C] mb-2">
                  {searchQuery ? 'No categories found matching your search.' : 'No course categories available.'}
                </h3>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[#BF4BF6] hover:underline"
                  >
                    Clear search
                  </button>
                )}
                <p className="text-sm text-[#52007C]/70 mt-2">
                  {searchQuery ? 'Try different search terms or explore other categories.' : 'Categories will appear here when you have enrolled courses or when active categories are available.'}
                </p>
              </div>
            ) : !error ? (
              <PathGrid 
                paths={filteredPaths} 
                onExplore={handleExplore} 
              />
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;