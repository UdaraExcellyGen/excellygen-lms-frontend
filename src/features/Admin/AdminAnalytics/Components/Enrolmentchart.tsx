import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getEnrollmentAnalytics, EnrollmentChartItem, CourseCategoryDto } from '../../../../api/analyticsApi';
import Select, { StylesConfig } from 'react-select';
import EnrollmentKpiCards from './EnrollmentKpiCards';

const formatName = (name: string, maxLength: number = 20) => {
  if (!name) return "Unknown";
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength).trim()}...`;
};

interface ChartDisplayData extends EnrollmentChartItem {
  displayName: string;
}

interface CategoryOption {
  value: string;
  label: string;
  totalCourses?: number;
}

const EnrollmentChart: React.FC = () => {
  const [courseData, setCourseData] = useState<ChartDisplayData[]>([]);
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [isCoursesLoading, setIsCoursesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setError(null);
        const response = await getEnrollmentAnalytics(null);
        const sortedCategories = [...(response.categories || [])].sort((a, b) => a.title.localeCompare(b.title));
        setCategories(sortedCategories);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories for selection.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setCourseData([]);
      return;
    }
    const fetchCourseDataForCategory = async (categoryId: string) => {
      try {
        setIsCoursesLoading(true);
        setError(null);
        const response = await getEnrollmentAnalytics(categoryId);
        const transformedData = response.enrollmentData.map(item => ({
          ...item,
          displayName: formatName(item.name),
        }));
        setCourseData(transformedData);
      } catch (err) {
        console.error('Error loading enrollment data for category:', err);
        setError('Failed to load course enrollment data.');
      } finally {
        setIsCoursesLoading(false);
      }
    };
    fetchCourseDataForCategory(selectedCategory.value);
  }, [selectedCategory]);

  const categoryOptions: CategoryOption[] = useMemo(() => 
    categories.map(cat => ({ 
      value: cat.id, 
      label: cat.title,
      totalCourses: cat.totalCourses,
    })), [categories]);

  const selectStyles: StylesConfig<CategoryOption> = {
    control: base => ({ ...base, borderRadius: '0.5rem', borderColor: '#e2e8f0', boxShadow: 'none', '&:hover': { borderColor: '#BF4BF6' } }),
    menu: base => ({ ...base, borderRadius: '0.5rem', zIndex: 20 }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? '#F6E6FF' : 'white',
      color: '#1B0A3F',
      cursor: 'pointer',
    }),
  };

  const CustomOption = ({ innerProps, label, data }: any) => (
    <div {...innerProps} className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex justify-between items-center">
      <span>{label}</span>
      {data.totalCourses !== undefined && (
        <span className="text-sm text-[#BF4BF6] bg-[#F6E6FF] px-2 py-0.5 rounded-full">
          {data.totalCourses} course{data.totalCourses !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-['Unbounded'] mb-4 text-[#1B0A3F]">Enrollment Analytics</h2>

      <EnrollmentKpiCards />

      <div className="bg-white/50 rounded-lg p-4">
        {/* --- THIS IS THE MODIFIED SECTION --- */}
        <div className="mb-6 max-w-2xl mx-auto">
          <label id="category-select-label" className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Select a Course Category to View Enrollment Details
          </label>
          <Select
            inputId="category-select"
            aria-labelledby="category-select-label"
            placeholder="Search and select a category..."
            isClearable
            isLoading={isCategoriesLoading}
            options={categoryOptions}
            onChange={(option) => setSelectedCategory(option as CategoryOption | null)}
            value={selectedCategory}
            components={{ Option: CustomOption }}
            styles={selectStyles}
          />
        </div>

        <div className="h-96 w-full">
          {isCoursesLoading ? (
            <div className="flex items-center justify-center h-full"><p>Loading course data...</p></div>
          ) : error && !isCategoriesLoading ? (
             <div className="flex items-center justify-center h-full text-red-500">{error}</div>
          ) : !selectedCategory ? (
            <div className="flex items-center justify-center h-full text-gray-500"><p>Please select a category to see the enrollment breakdown.</p></div>
          ) : courseData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500"><p>No enrollment data found for this category.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseData} margin={{ top: 20, right: 30, left: 20, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F6E6FF" />
                <XAxis dataKey="displayName" tick={{ fontSize: 10, fill: "#1B0A3F" }} label={{ value: "Courses",  position: "insideBottom", fill: "#1B0A3F",dy: 45 }}interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#1B0A3F" }} label={{ value: "No. of Learners", angle: -90, position: "insideLeft", fill: "#1B0A3F" }} />
                <Tooltip
                  cursor={{ fill: 'rgba(191, 75, 246, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const total = item.completed + item.inProgress;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#BF4BF6]/20">
                          <p className="text-sm font-bold text-[#1B0A3F] mb-2">{item.name}</p>
                          <p className="text-sm flex items-center"><span className="w-3 h-3 rounded-sm bg-[#52007C] mr-2"></span>Completed Learners: {item.completed}</p>
                          <p className="text-sm flex items-center"><span className="w-3 h-3 rounded-sm bg-[#D68BF9] mr-2"></span>In-Progress Learners: {item.inProgress}</p>
                          <hr className="my-1 border-t border-gray-200" />
                          <p className="text-sm font-semibold text-[#1B0A3F]">Total Enrollments: {total}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
                <Bar dataKey="completed" name="Completed Learners" stackId="a" fill="#52007C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In-Progress Learners" stackId="a" fill="#D68BF9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentChart;