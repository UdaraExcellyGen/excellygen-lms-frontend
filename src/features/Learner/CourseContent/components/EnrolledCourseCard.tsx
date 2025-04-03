import React from 'react';
import { Clock, Layers, XCircle } from 'lucide-react';
import { Course } from '../types/Course';

interface EnrolledCourseCardProps {
  course: Course;
  onUnenroll: (course: Course) => void;
  onContinueLearning: (courseId: string) => void;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ 
  course, 
  onUnenroll, 
  onContinueLearning 
}) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 relative min-h-[400px] transition-all duration-300">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl text-white font-unbounded font-bold">
            {course.title}
          </h3>
          <button
            onClick={() => onUnenroll(course)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Unenroll from course"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
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
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="text-[#D68BF9] text-sm font-nunito">
            {course.progress}% Complete
          </p>
        </div>
        <button 
          onClick={() => onContinueLearning(course.id)}
          className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;