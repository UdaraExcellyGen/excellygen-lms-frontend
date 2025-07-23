// src/features/Learner/CourseContent/components/EnrolledCourseCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, LogOut, BookOpen as LessonIcon } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types';
import { BookOpen as ThumbnailIcon } from 'lucide-react';

interface EnrolledCourseCardProps {
  course: LearnerCourseDto;
  onContinueLearning: (courseId: number) => void;
  onUnenrollClick: (course: LearnerCourseDto) => void; // The only unenroll prop it uses
  loading: boolean;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ course, onContinueLearning, onUnenrollClick, loading }) => {
  const navigate = useNavigate();
  const progressPercentage = course.progressPercentage || 0;
  
  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinueLearning(course.id);
  };
  
  // CLEANED HANDLER: This now *only* calls the parent function. It has no internal logic.
  // This will trigger the correct white-and-red modal from CourseGrid.
  const handleUnenroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnenrollClick(course); 
  };
  
  const handleCardClick = () => {
    navigate(`/learner/course-view/${course.id}`);
  };
  
  return (
    <div 
      className="bg-white/90 backdrop-blur-md rounded-lg overflow-hidden border border-purple-500/10 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-purple-500/30 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-40 overflow-hidden relative">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#34137C] to-[#52007C] flex items-center justify-center">
              <ThumbnailIcon className="w-12 h-12 text-[#D68BF9]" />
          </div>
        )}
        
        {course.category?.title && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {course.category.title}
          </span>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/20 backdrop-blur-sm flex items-center justify-between gap-3">
          <span className="text-white text-xs font-semibold whitespace-nowrap">Progress: {progressPercentage}%</span>
          <div className="w-full bg-gray-200/50 rounded-full h-1.5"><div className={`h-full rounded-full ${progressPercentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9]'}`} style={{ width: `${progressPercentage}%` }}></div></div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-gray-900 font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>
        
        {/* UPDATED: Technology tags now match available courses display */}
        {course.technologies && course.technologies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {course.technologies.slice(0, 3).map(tech => (
              <span key={tech.id} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">{tech.name}</span>
            ))}
            {course.technologies.length > 3 && (
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">+{course.technologies.length - 3}</span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center text-gray-500 text-xs mt-auto mb-4">
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-purple-600"/><span>{course.estimatedTime} hours</span></div>
          {progressPercentage === 100 ? (
             <div className="flex items-center text-green-600 font-medium gap-1.5"><CheckCircle size={14} /><span>Completed</span></div>
          ) : (
             <div className="flex items-center gap-1.5"><LessonIcon size={14} className="text-purple-600"/><span>Lessons: {course.completedLessons || 0}/{course.totalLessons || 'N/A'}</span></div>
          )}
        </div>
        
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white hover:shadow-lg hover:scale-[1.02] disabled:opacity-70"
          >
            {progressPercentage === 100 ? 'View Course' : 'Continue Learning'}
          </button>
          
          {progressPercentage < 100 && (
            <button
              onClick={handleUnenroll} // This now correctly calls the parent handler
              disabled={loading}
              className="px-3 bg-white border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              title="Unenroll from course"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;