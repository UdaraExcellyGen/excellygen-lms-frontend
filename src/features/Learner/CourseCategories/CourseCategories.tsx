import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Sidebar/Layout';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import PathGrid from './components/PathGrid';
import { pathsData } from './data/pathsData';

const CourseCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleExplore = (pathTitle: string) => {
    navigate(`/courses/${encodeURIComponent(pathTitle)}`);
  };

  const filteredPaths = pathsData.filter(path => {
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
          <PathGrid 
            paths={filteredPaths} 
            onExplore={handleExplore} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default CourseCategories;