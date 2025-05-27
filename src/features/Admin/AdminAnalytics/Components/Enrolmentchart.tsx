// src/features/admin/Analytics/Components/Enrolmentchart.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getEnrollmentAnalytics } from '../../../../api/analyticsApi';
import Select from 'react-select';

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
  totalCourses?: number;
}

// Function to format course names to show only two words
const formatCourseName = (name: string | undefined) => {
  if (!name) return "Unknown"; // Guard against undefined names
  
  const words = name.split(' ');
  if (words.length <= 2) {
    return name;
  }
  return `${words[0]} ${words[1]}...`;
};

const EnrollmentChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    // Just load categories initially
    fetchCategories();
  }, []);

  useEffect(() => {
    // Only fetch enrollment data when a category is selected
    if (selectedCategory) {
      fetchEnrollmentData(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getEnrollmentAnalytics(null);
      
      // Sort categories alphabetically for better searchability
      const sortedCategories = [...(response.categories || [])].sort((a, b) => 
        a.title.localeCompare(b.title)
      );
      
      setCategories(sortedCategories);
      setError(null);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentData = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await getEnrollmentAnalytics(categoryId);
      
      // Transform data for horizontal bar chart with formatted names
      // Use name and value properties that match the backend response
      const transformedData = response.enrollmentData.map(item => ({
        name: formatCourseName(item.name),
        fullName: item.name, // Store full name for tooltip
        value: item.value
      }));
      
      // Sort data by value in descending order for better visualization
      const sortedData = [...transformedData].sort((a, b) => b.value - a.value);
      
      setData(sortedData);
      setShowChart(true);
      setError(null);
    } catch (err: any) {
      console.error('Error loading enrollment data:', err);
      setError('Failed to load enrollment data');
      setShowChart(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (selected: any) => {
    if (selected) {
      setSelectedCategory(selected.value);
      // Reset search input when a category is selected
      setSearchInput('');
    } else {
      setSelectedCategory(null);
      setShowChart(false);
    }
  };

  // Filter categories based on search input
  const filterCategories = (inputValue: string) => {
    return categories.filter(cat => 
      cat.title.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Prepare options for the select dropdown
  const categoryOptions = categories.map(cat => ({ 
    value: cat.id, 
    label: cat.title,
    totalCourses: cat.totalCourses
  }));

  // Custom option renderer for the dropdown to show course count
  const CustomOption = ({ innerProps, label, data }: any) => (
    <div 
      {...innerProps} 
      className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex justify-between items-center"
    >
      <span>{label}</span>
      {data.totalCourses !== undefined && (
        <span className="text-sm text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
          {data.totalCourses} course{data.totalCourses !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );

  if (loading && !categories.length) return <div className="bg-white rounded-2xl p-6">Loading categories...</div>;
  if (error && !categories.length) return <div className="bg-white rounded-2xl p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl p-6 mb-4">
      <h2 className="text-xl font-['Unbounded'] mb-6">Enrollment Analytics</h2>
      
      {/* Category Filter Dropdown */}
      <div className="mb-6">
        <label id="category-select-label" className="block text-sm font-medium text-gray-700 mb-1">
          Select a Course Category
        </label>
        <Select
          inputId="category-select"
          aria-labelledby="category-select-label"
          className="basic-single"
          classNamePrefix="select"
          placeholder="Search and select a course category..."
          noOptionsMessage={() => "No categories found"}
          isClearable
          isSearchable={true}
          options={categoryOptions}
          onChange={handleCategoryChange}
          onInputChange={(input) => setSearchInput(input)}
          filterOption={(option, input) => {
            if (!input) return true;
            return option.label.toLowerCase().includes(input.toLowerCase());
          }}
          components={{
            Option: CustomOption
          }}
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: '0.5rem',
              borderColor: '#e2e8f0',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#52007C'
              }
            }),
            menu: (base) => ({
              ...base,
              borderRadius: '0.5rem',
              marginTop: '0.25rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#52007C' : state.isFocused ? 'rgba(82, 0, 124, 0.1)' : base.backgroundColor,
              color: state.isSelected ? 'white' : base.color,
              '&:active': {
                backgroundColor: 'rgba(82, 0, 124, 0.2)'
              }
            }),
            input: (base) => ({
              ...base,
              color: '#1a202c'
            }),
            placeholder: (base) => ({
              ...base,
              color: '#a0aec0'
            }),
            singleValue: (base) => ({
              ...base,
              color: '#1a202c'
            })
          }}
        />
        {categories.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {categories.length} categories available
          </div>
        )}
      </div>
      
      {showChart ? (
        loading ? (
          <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-purple-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2">Loading enrollment data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-10">No enrollment data available for this category</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data}
                margin={{ top: 5, right: 30, left: 35, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14 }}
                  interval={0}
                  tickMargin={12}
                  label={{ value: "Courses", position: "bottom", offset: 5 }}
                />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  tickCount={5}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  tickFormatter={(value) => Math.floor(value)}
                  axisLine={false}
                  label={{ 
                    value: "No of Learners", 
                    position: "insideLeft",
                    angle: -90,
                    style: { textAnchor: 'middle' },
                    offset: 0
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(82, 0, 124, 0.1)' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                          <p className="text-sm font-semibold">{payload[0].payload.fullName}</p>
                          <p className="text-sm text-[#52007C]">Learners: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#52007C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : (
        <div className="text-center py-10 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <p>Please select a course category to view enrollment analytics</p>
          <p className="mt-2 text-sm text-purple-600">
            {categories.length > 0 ? 
              `Choose from ${categories.length} available categories` : 
              'No categories available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnrollmentChart;