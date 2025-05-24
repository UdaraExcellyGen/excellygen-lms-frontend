// src/types/course.types.ts

// DTOs matching backend structures (from `Application/DTOs/Course`)

export interface CategoryDto {
    id: string;
    title: string;
  }
  
  export interface TechnologyDto {
    id: string;
    name: string;
  }
  
  export interface UserBasicDto {
    id: string;
    name: string;
  }
  
  // Mirror the backend's CourseDocumentDto
  export interface CourseDocumentDto {
      id: number;
      name: string;
      documentType: 'PDF' | 'Word'; // Match backend Enum strings
      fileSize: number;
      fileUrl: string;
      lastUpdatedDate: string; // Typically string in JSON (ISO 8601 format)
      lessonId: number;
  }
  
  // Mirror the backend's LessonDto
  export interface LessonDto {
      id: number;
      lessonName: string;
      lessonPoints: number;
      lastUpdatedDate: string; // ISO 8601 format
      courseId: number;
      documents: CourseDocumentDto[];
  }
  
  // Mirror the backend's CourseDto
  export interface CourseDto {
      id: number;
      title: string;
      description?: string;
      calculatedCoursePoints?: number;
      estimatedTime: number;
      createdAt: string; // ISO 8601 format
      lastUpdatedDate: string; // ISO 8601 format
      status: 'Draft' | 'Published' | 'Archived'; // Match backend Enum strings
      thumbnailUrl?: string;
      category: CategoryDto;
      creator: UserBasicDto;
      technologies: TechnologyDto[];
      lessons: LessonDto[];
  }
  
  
  // --- Frontend State Specific Types ---
  
  // State managed in BasicCourseDetails component
  export interface BasicCourseDetailsState {
      title: string;
      description: string;
      // Store as string temporarily matching input, convert to number on submit
      estimatedTime: string;
      categoryId: string; // Store ID, not name
      technologies: string[]; // Store list of IDs, not names
      thumbnail: File | null;
  }
  
  // Type for available category options in the dropdown
  export interface CategoryOption {
      id: string;
      title: string;
  }
  
  // Type for available technology options in the dropdown
  export interface TechnologyOption {
      id: string;
      name: string;
  }

  // --- State/Types for UploadMaterials ---

// Represents an existing, saved document linked to a lesson
export interface ExistingMaterialFile {
    id: number; // Database ID
    name: string;
    type: 'document'; // Only documents handled for now, expand later
    fileUrl: string; // URL from backend
    documentType: 'PDF' | 'Word';
    fileSize: number;
    lessonId: number;
}

// Represents a Lesson/Subtopic in the frontend state
// Closely matches LessonDto but might hold temporary edit state
export interface SubtopicFE {
    id: number; // Database Lesson ID
    lessonName: string;
    lessonPoints: number;
    courseId: number; // Needed? Maybe from URL param is enough
    documents: ExistingMaterialFile[]; // Holds saved documents
    // Add Quiz related fields if/when needed
    // hasQuiz?: boolean;
    // quizBank?: QuizBank | null;

    // Optional fields for managing edit state in the UI
    isEditing?: boolean;
    originalName?: string;
    originalPoints?: number;
}


  
  // Extend this as needed for other steps (Upload Materials state, etc.)
  
  // Interface for the structure managed by CourseContext (can evolve)
  export interface CourseContextState {
      createdCourseId: number | null; // Store ID after creation
      basicDetails: BasicCourseDetailsState; // Store state from step 1
      // Changed materials to reflect lessons from backend
    lessons: SubtopicFE[]; // Use the frontend-specific type
    // Flag to indicate if lessons have been loaded for the current course ID
    lessonsLoaded: boolean;
      // Add state for step 2 (materials) and step 3 (publish details) later
      // e.g., materials: Subtopic[]
  }

  // --- Lesson Operation Payloads (Matching DTOs used in Service) ---
export interface CreateLessonPayload {
    courseId: number;
    lessonName: string;
    lessonPoints: number;
}

export interface UpdateLessonPayload {
    lessonName: string;
    lessonPoints: number;
}

export interface CourseDto {
    id: number;
    title: string;
    description?: string;
    calculatedCoursePoints?: number;
    estimatedTime: number;
    createdAt: string;
    lastUpdatedDate: string;
    status: 'Draft' | 'Published' | 'Archived';
    thumbnailUrl?: string;
    category: CategoryDto;
    creator: UserBasicDto;
    technologies: TechnologyDto[];
    lessons: LessonDto[];
}

// DTO for Course Coordinator to update a course
// This is what the backend `PUT /api/courses/{id}` endpoint expects in its body
// (excluding the IFormFile part which is handled by FormData)
export interface UpdateCourseCoordinatorDtoFE { 
    title: string;
    description?: string;
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
    // ThumbnailImage is handled as a File object separately when constructing FormData
}