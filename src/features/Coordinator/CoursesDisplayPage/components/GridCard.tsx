import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseDto } from '../../../../types/course.types'; 

interface GridCardProps {
    course: CourseDto;
    onDeleteCourse: (id: number) => void;
    currentUserId: string;
}


// Ensure this matches the enum values/strings from your backend
const formatCourseStatus = (status: 'Draft' | 'Published' | 'Archived' | number): string => {
    if (typeof status === 'number') {
        switch (status) {
            case 0: return 'Draft';
            case 1: return 'Published';
            case 2: return 'Archived'; 
            default: return 'Unknown';
        }
    }
    // If it's already a string that matches the expected literals
    if (status === 'Draft' || status === 'Published' || status === 'Archived') {
        return status;
    }
    return 'Unknown'; 
};


export const GridCard: React.FC<GridCardProps> = ({ course, onDeleteCourse, currentUserId }) => {
    const navigate = useNavigate();
    const isCoordinatorCourse = course.creator.id === currentUserId;
    const defaultThumbnailUrl = "https://th.bing.com/th/id/R.4610eb77b85be4a7292be7fd16029bb6?rik=eZLumiuNKTzW9w&pid=ImgRaw&r=0";

    const onDeleteClick = () => {
        onDeleteCourse(course.id);
    };

    const handleEditClick = () => {
        navigate(`/coordinator/course-details/${course.id}`);
    };

    const handleViewCourseClick = () => {
        navigate(`/coordinator/course-view/${course.id}`);
    };

    const displayStatus = formatCourseStatus(course.status); 

    return (
        <div className="bg-white rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
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
                            {course.category.title}
                        </span>
                        <span className={`px-2 sm:px-3 py-0.5 rounded-[15px] text-xs sm:text-sm md:text-sm capitalize whitespace-nowrap ${
                            // Use displayStatus for conditional styling
                            displayStatus === 'Published' ? 'bg-green-100 text-green-700' :
                            displayStatus === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700' // Default or for 'Archived'
                        }`}>
                            {displayStatus} {/* Display the formatted status string */}
                        </span>
                    </div>
                    {/* ... Edit/Delete buttons ... */}
                    <div className="flex gap-1">
                        {isCoordinatorCourse && (
                            <>
                                <button
                                    onClick={handleEditClick}
                                    className="text-gray-600 hover:text-gray-800 p-1 rounded-full"
                                    aria-label={`Edit course ${course.title}`}
                                >
                                    <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                    onClick={onDeleteClick}
                                    className="text-gray-600 hover:text-gray-800 p-1 rounded-full"
                                    aria-label={`Delete course ${course.title}`}
                                >
                                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-2 truncate" title={course.title}>
                    {course.title}
                </h3>
                <p className="text-gray-500 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-sm">
                    Offered by {course.creator.name}
                </p>
            </div>

            <button
                className="w-full mt-auto py-2 sm:py-2.5 md:py-3 text-center text-white bg-[#BF4BF6] hover:bg-[#52007C] rounded-xl transition-colors text-sm md:text-sm"
                onClick={handleViewCourseClick}
            >
                View Course
            </button>
        </div>
    );
};