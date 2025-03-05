import React, { useState } from 'react';
import { 
  Search,
  Briefcase
} from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';
import { ProjectCard } from './components/ProjectCard';
import { ProjectStats } from './components/ProjectStats';
import { projects } from './data/projectData';
import { Project } from './types/Project';

const LearnerProjects: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = projects.filter((project: Project) => {
    if (filter !== 'all' && project.status.toLowerCase() !== filter.toLowerCase()) return false;
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-3xl md:text-4xl text-center font-bold bg-gradient-to-r from-white via-white bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-[#D68BF9] text-center mt-1">Track your project assignments and achievements</p>
          </div>

          {/* Stats Cards */}
          <ProjectStats projects={projects} />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-none focus:ring-0 text-gray-600 placeholder-gray-400"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-[#1B0A3F]"
              >
                <option value="all">All Projects</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-white py-12">
                  <Briefcase className="h-16 w-16 text-[#D68BF9] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                  <p className="text-[#D68BF9] text-center">Try adjusting your search or filter to find projects</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearnerProjects;