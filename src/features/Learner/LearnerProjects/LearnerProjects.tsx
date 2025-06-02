// Path: src/features/Learner/LearnerProjects/LearnerProjects.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'; 
import Layout from '../../../components/Sidebar/Layout';
import { ProjectCard } from './components/ProjectCard';
import { ProjectStats } from './components/ProjectStats';
import { Project } from './types/Project'; // Removed ProjectStatus
import { useAuth } from '../../../contexts/AuthContext';
import { learnerProjectApi } from '../../../api/services/learnerProjectService';
import { toast } from 'react-hot-toast';

const LearnerProjects: React.FC = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useAuth();

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage: number = 6; // Display 6 projects per page

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setAllProjects([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      setCurrentPage(1); // Reset to first page on new fetch
      try {
        const projectsData = await learnerProjectApi.getUserProjects(user.id);
        setAllProjects(projectsData);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError('Failed to load your projects. Please try refreshing the page.');
        toast.error('Failed to load projects.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [user?.id]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project: Project) => {
      const projectStatusLower = project.status.toLowerCase();
      const filterLower = filter.toLowerCase();
      if (filterLower !== 'all' && projectStatusLower !== filterLower) return false;
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allProjects, filter, searchQuery]);

  // --- Pagination Logic ---
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjectsToDisplay = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  }

  // UI Rendering Logic
  if (!user && isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
          <p className="text-white text-lg">Authenticating user...</p>
        </div>
      </Layout>
    );
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="text-white ml-4 text-lg">Loading Projects...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex flex-col justify-center items-center text-white">
          <Briefcase className="h-16 w-16 text-[#D68BF9] mb-4" />
          <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong.</h2>
          <p className="text-[#D68BF9]">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6 flex flex-col"> {/* Added flex-col */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 flex-grow"> {/* Added flex-grow */}
          {/* Header */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-3xl md:text-4xl text-center font-bold bg-gradient-to-r from-white via-white bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-[#D68BF9] text-center mt-1">Track your project assignments and achievements</p>
          </div>

          <ProjectStats projects={allProjects} />

          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none focus:ring-0 text-gray-600 placeholder-gray-400 w-full"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[#1B0A3F] w-full sm:w-auto"
              >
                <option value="all">All Projects</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-8">
            {/* The h2 heading for "All My Projects" etc. is REMOVED as per earlier request */}
            
            {currentProjectsToDisplay.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProjectsToDisplay.map(project => (
                  <ProjectCard key={`${project.id}-${project.role}`} project={project} /> 
                  // Using a more unique key if ID might not be unique due to multiple roles in same project mapping to same backend ID before parsing
                ))}
              </div>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-white py-12">
                <Briefcase className="h-16 w-16 text-[#D68BF9] mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-[#D68BF9] text-center">
                  {allProjects.length === 0 && !searchQuery && filter === 'all'
                    ? "You don't have any projects assigned or completed yet."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-8 mb-4 flex justify-center items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center
                          ${currentPage === 1 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-[#BF4BF6] hover:bg-[#A030D0] text-white'}`}
            >
              <ChevronLeft size={18} className="mr-1" />
              Previous
            </button>

            {/* Page Numbers (Optional: Render a few page numbers) */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              // Limit number of page buttons displayed for very large number of pages
              .filter(pageNumber => 
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              )
              .map((pageNumber, index, arr) => (
                <React.Fragment key={pageNumber}>
                  {index > 0 && arr[index-1] !== pageNumber - 1 && <span className="text-white">...</span>} 
                  {/* Ellipsis for skipped numbers */}
                  <button
                    onClick={() => goToPage(pageNumber)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium
                                ${currentPage === pageNumber 
                                  ? 'bg-[#7A00B8] text-white' 
                                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                  >
                    {pageNumber}
                  </button>
                </React.Fragment>
            ))}


            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center
                          ${currentPage === totalPages 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : 'bg-[#BF4BF6] hover:bg-[#A030D0] text-white'}`}
            >
              Next
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LearnerProjects;