// src/features/Learner/CourseContent/components/AvailableCourseCard.tsx
import React from 'react';
import { LearnerCourseDto } from '../../../../types/course.types';
import { BookOpen, Clock, Users, Play, Pause } from 'lucide-react';

interface AvailableCourseCardProps {
  course: LearnerCourseDto;
  onEnroll: (courseId: number) => void;
  loading: boolean;
  isInactiveCategory: boolean;
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ course, onEnroll, loading, isInactiveCategory }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg overflow-hidden border border-purple-500/10 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-purple-500/30">
      <div className="h-40 overflow-hidden relative bg-gradient-to-br from-[#34137C] to-[#52007C]">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-[#D68BF9]" /></div>
        )}
        {course.category?.title && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {course.category.title}
          </span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {/* CORRECTED: Course title now has space for two lines */}
        <h3 className="text-gray-900 font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>
        
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
        
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center text-gray-500 text-xs mb-4">
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-purple-600"/><span>{course.estimatedTime} hours</span></div>
          <div className="flex items-center gap-1.5"><Users size={14} className="text-purple-600"/><span>{course.activeLearners || 0} learners</span></div>
        </div>
        
        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEnroll(course.id); }}
            disabled={loading || isInactiveCategory}
            className={`w-full flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${isInactiveCategory ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white hover:shadow-lg hover:scale-[1.02]'}`}
          >
            {isInactiveCategory ? <Pause size={16} /> : <Play size={16} />}
            {isInactiveCategory ? 'Enrollment Paused' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableCourseCard;