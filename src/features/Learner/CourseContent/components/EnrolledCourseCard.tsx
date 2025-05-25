// src/features/Learner/CourseContent/components/EnrolledCourseCard.tsx
import React from 'react';
import { Clock, Layers, XCircle } from 'lucide-react';
import { LearnerCourseDto } from '../../../../types/course.types'; // Use LearnerCourseDto directly

interface EnrolledCourseCardProps {
  course: LearnerCourseDto; // Expects LearnerCourseDto
  onUnenroll: (course: LearnerCourseDto) => void; // Pass entire course object for unenroll confirmation
  onContinueLearning: (courseId: number) => void; // Expects number ID
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ 
  course, 
  onUnenroll, 
  onContinueLearning 
}) => {
  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 relative min-h-[400px] flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div>
        {course.thumbnailUrl && (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-40 object-cover rounded-md mb-4" />
        )}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl text-white font-unbounded font-bold mb-2">
            {course.title}
          </h3>
          {/* Only allow unenroll if course is active (not completed) */}
          {course.enrollmentStatus === 'active' && (
            <button
              onClick={() => onUnenroll(course)}
              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
              title="Unenroll from course"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
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
        </div>
      </div>
      <div className="mt-auto space-y-2 pt-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] transition-all duration-300"
            style={{ width: `${course.progressPercentage}%` }}
          />
        </div>
        <p className="text-[#D68BF9] text-sm font-nunito">
          {course.progressPercentage}% Complete ({course.completedLessons}/{course.totalLessons} Lessons)
        </p>
        <button 
          onClick={() => onContinueLearning(course.id)}
          className="w-full px-6 py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:scale-105 hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 font-nunito shadow-lg"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;