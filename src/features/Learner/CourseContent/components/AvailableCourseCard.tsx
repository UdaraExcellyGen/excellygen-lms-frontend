// src/features/Learner/CourseContent/components/AvailableCourseCard.tsx
import React from 'react';
import { Clock, Layers, Users } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types'; // Use LearnerCourseDto directly

interface AvailableCourseCardProps {
  course: LearnerCourseDto; // Expects LearnerCourseDto
  onEnroll: (courseId: number) => void; // Expects number ID
  loading: boolean;
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  course, 
  onEnroll, 
  loading 
}) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 relative min-h-[400px] flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div>
        {course.thumbnailUrl && (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover rounded-md mb-4" />
        )}
        <h3 className="text-xl text-white font-unbounded font-bold mb-2">
          {course.title}
        </h3>
        <p className="text-[#D68BF9] text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span className="font-nunito">{course.estimatedTime} Hours</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Layers className="h-4 w-4" />
            <span className="font-nunito">{course.category.title}</span>
          </div>
          {/* Removed dynamic activeUsers, using static placeholder or status */}
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span className="font-nunito">{course.status === 'Published' ? 'Available' : course.status}</span>
          </div>
        </div>
      </div>
      <button 
        onClick={() => onEnroll(course.id)}
        disabled={loading}
        className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </button>
    </div>
  );
};

export default AvailableCourseCard;