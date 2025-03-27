// features/createNewCourse/CoursesDisplayPage/components/GridCard.tsx
import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../types/Course';

interface GridCardProps {
    course: Course;
    onDeleteCourse: (id: string) => void;
}

export const GridCard: React.FC<GridCardProps> = ({ course, onDeleteCourse }) => {
    const navigate = useNavigate();
    const currentCoordinator = 'Sehani Silva';
    const isCoordinatorCourse = course.instructor === currentCoordinator;
    const defaultThumbnailUrl = "https://th.bing.com/th/id/R.4610eb77b85be4a7292be7fd16029bb6?rik=eZLumiuNKTzW9w&pid=ImgRaw&r=0";

    const onDeleteClick = () => {
        onDeleteCourse(course.id);
    };

    return (
        <div className="bg-white rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
            <div className="mb-2 sm:mb-3 md:mb-4">
                <img
                    src={course.thumbnailUrl || defaultThumbnailUrl}
                    alt={course.title}
                    className="w-full h-24 sm:h-32 tablet:h-40 md:h-48 object-cover rounded-2xl"
                />
            </div>

            <div className="flex justify-between items-center mb-2 sm:mb-3 md:mb-4">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className="px-2 sm:px-3 py-0.5 bg-gray-100 text-gray-600 rounded-[15px] text-xs sm:text-sm md:text-sm whitespace-nowrap">
                        {course.category}
                    </span>
                    <span className="px-2 sm:px-3 py-0.5 bg-gray-100 text-gray-600 rounded-[15px] text-xs sm:text-sm md:text-sm capitalize whitespace-nowrap">
                        {course.status}
                    </span>
                </div>
                <div className="flex gap-1">
                    {isCoordinatorCourse && (
                        <>
                            <button
                                onClick={() => navigate(`/coordinator/course-view`)}
                                className="text-gray-600 hover:text-gray-800 p-1 rounded-full"
                                aria-label={`Edit course ${course.title}`}
                            >
                                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                                onClick={onDeleteClick}
                                className="text-gray-600 hover:text-gray-800 p-1 rounded-full"
                                aria-label={`Request delete course ${course.title}`}
                            >
                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-2">
                {course.title}</h3>
            <p className="text-gray-500 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-sm">Offered by {course.instructor}</p>
            <div className="flex gap-2 sm:gap-3 md:gap-4 text-gray-500 text-xs sm:text-sm md:text-sm mb-3 sm:mb-4 md:mb-6">
                <span>{course.studentCount} Students</span>
            </div>

            <button className="w-full py-2 sm:py-2.5 md:py-3 text-center text-white bg-[#BF4BF6] hover:bg-[#52007C] rounded-xl transition-colors text-sm md:text-sm"
                onClick={() => navigate('/coordinator/course-view')}
            >
                View Course
            </button>
        </div>
    );
};