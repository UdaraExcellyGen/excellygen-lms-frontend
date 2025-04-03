import React from 'react';
import { Clock, Layers, Users } from 'lucide-react';
import { Course } from '../types/Course';

interface AvailableCourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  loading: boolean;
}

const AvailableCourseCard: React.FC<AvailableCourseCardProps> = ({ 
  course, 
  onEnroll, 
  loading 
}) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 relative min-h-[400px] transition-all duration-300">
      <div className="space-y-6">
        <h3 className="text-xl text-white font-unbounded font-bold">
          {course.title}
        </h3>
        <p className="text-[#D68BF9] font-nunito">
          {course.description}
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span className="font-nunito">{course.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Layers className="h-4 w-4" />
            <span className="font-nunito">{course.level}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="h-4 w-4" />
            <span className="font-nunito">{course.activeUsers} Active Learners</span>
          </div>
        </div>
        <button 
          onClick={() => onEnroll(course.id)}
          disabled={loading}
          className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg disabled:opacity-50"
        >
          {loading ? 'Enrolling...' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );
};

export default AvailableCourseCard;