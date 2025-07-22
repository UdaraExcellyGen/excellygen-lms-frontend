// src/types/course.types.ts
// =================================================================
// --- Enums ---
// =================================================================

export enum CourseStatus {
    Draft = 'Draft',
    Published = 'Published',
    Archived = 'Archived'
}

export enum DocumentType {
    PDF = 'PDF',
    Video = 'Video',
    Word = 'Word'
}


// =================================================================
// --- Core DTOs (from Backend) ---
// =================================================================

export interface UserDto {
    id: string;
    name: string;
    email: string;
    roles: string[];
}

export interface CourseCategoryDto {
    id: string;
    title: string;
    name: string; // for compatibility
    description?: string;
    iconName?: string;
    isActive: boolean;
}

// FIX: Added a type alias for backward compatibility to resolve import errors.
export type CategoryDto = CourseCategoryDto;

export interface TechnologyDto {
    id: string; // Using string to align with CreateCoursePayload
    name: string;
    description?: string;
    status?: string;
}

export interface ExistingMaterialFile {
    id: number;
    lessonId: number;
    name: string;
    documentType: DocumentType | string;
    fileUrl: string;
    fileSize: number;
    lastUpdatedDate: string;
}

export interface CourseDocumentDto {
    id: number;
    lessonId: number;
    name: string;
    documentType: DocumentType | string;
    filePath: string;
    fileUrl: string; // Publicly accessible URL
    fileSize: number; // In bytes
    uploadedAt: string; // ISO 8601 string
    lastUpdatedDate: string; // ISO 8601 string for compatibility
}

export interface LessonDto {
    id: number;
    courseId: number;
    lessonName: string;
    lessonPoints: number;
    lessonOrder: number;
    content?: string;
    videoUrl?: string;
    lastUpdatedDate: string; // ISO 8601 string
    documents: CourseDocumentDto[];
    quizzes?: QuizDto[]; // This will now correctly use the unified QuizDto below
}

export interface CourseDto {
    id: number;
    title: string;
    description: string | null;
    estimatedTime: number; // In Hours
    calculatedCoursePoints?: number;
    status: CourseStatus;
    isInactive: boolean;
    thumbnailUrl: string | null; // For frontend display
    thumbnailImagePath?: string; // Path from backend
    createdAt: string; // ISO 8601 string
    lastUpdatedDate: string; // ISO 8601 string
    creatorId: string;
    creator: UserDto;
    categoryId: string;
    category: CourseCategoryDto;
    lessons: LessonDto[];
    technologies: TechnologyDto[];
}


// =================================================================
// --- Learner-Specific DTOs ---
// =================================================================

export interface LearnerLessonDto {
    id: number;
    courseId: number;
    lessonName: string;
    lessonOrder: number;
    lessonPoints: number;
    content?: string;
    videoUrl?: string;
    documents: CourseDocumentDto[];
    isCompleted: boolean;
    hasQuiz: boolean;
    quizId?: number | null;
    isQuizCompleted: boolean;
    lastAttemptId?: number | null;
    quizAttemptCount?: number;
    isQuizPassed?: boolean;
}

export interface LearnerCourseDto {
    id: number;
    title: string;
    description: string | null;
    estimatedTime: number;
    status: CourseStatus;
    isInactive: boolean;
    thumbnailUrl: string | null;
    thumbnailImagePath?: string;
    category: CourseCategoryDto;
    creator: UserDto;
    technologies: TechnologyDto[];
    lessons: LearnerLessonDto[];
    enrollmentId: number | null;
    isEnrolled: boolean;
    enrollmentDate: string | null; // ISO 8601
    enrollmentStatus: 'active' | 'completed' | 'inactive';
    completedAt?: string | null; // ISO 8601
    progressPercentage: number;
    totalLessons: number;
    completedLessons: number;
}


// =================================================================
// --- Certificate Types ---
// =================================================================

export interface CertificateDto {
    id: number;
    userId: string;
    userName: string;
    courseId: number;
    courseTitle: string;
    completionDate: string; // ISO 8601
    title: string;
    certificateFileUrl?: string;
    type: 'internal';
}

export interface ExternalCertificateDto {
    id: string;
    userId: string;
    userName: string;
    title: string;
    issuer: string;
    platform: string;
    completionDate: string; // ISO 8601
    credentialUrl?: string;
    credentialId?: string;
    description?: string;
    imageUrl?: string;
    type: 'external';
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

export type CombinedCertificateDto = CertificateDto | ExternalCertificateDto;


// =================================================================
// --- Quiz Types (FIXED: Unified from quiz.types.ts) ---
// =================================================================

// Summary DTO for listing quizzes
export interface QuizDto {
    quizId: number;
    quizTitle: string;
    timeLimitMinutes: number;
    totalMarks: number;
    quizSize: number;
    quizBankId: number;
    lessonId: number;
    lessonName?: string;
}

// Detailed DTO for quiz view/edit
export interface QuizDetailDto {
    quizId: number;
    quizTitle: string;
    timeLimitMinutes: number;
    totalMarks: number;
    quizSize: number;
    quizBankId: number;
    lessonId: number;
    lessonName?: string;
    questions: QuizBankQuestionDto[];
}

export interface QuizBankQuestionDto {
    quizBankQuestionId: number;
    questionContent: string;
    questionType: string;
    questionBankOrder?: number;
    options: MCQQuestionOptionDto[];
}

export interface MCQQuestionOptionDto {
    mcqOptionId: number;
    optionText: string;
    isCorrect: boolean;
}

// DTOs for quiz attempts (learner-facing)
export interface LearnerQuizQuestionDto {
    quizBankQuestionId: number;
    questionContent: string;
    questionType: string;
    options: LearnerMCQOptionDto[];
}

export interface LearnerMCQOptionDto {
    mcqOptionId: number;
    optionText: string;
}

export interface QuizAttemptDto {
    quizAttemptId: number;
    quizId: number;
    quizTitle: string;
    timeLimitMinutes: number;
    startTime: string; // ISO 8601
    completionTime?: string | null; // ISO 8601
    score?: number | null;
    isCompleted: boolean;
    totalQuestions: number;
    correctAnswers: number;
    timeRemainingSeconds?: number;
    selectedAnswers?: Record<number, number>;
}

export interface QuizAttemptAnswerDto {
    quizAttemptAnswerId: number;
    quizAttemptId: number;
    quizBankQuestionId: number;
    questionContent: string;
    selectedOptionId?: number | null;
    selectedOptionText?: string | null;
    correctOptionId: number;
    correctOptionText: string;
    isCorrect: boolean;
}


// =================================================================
// --- Enrollment & Progress Types ---
// =================================================================

export interface EnrollmentDto {
    id: number;
    userId: string;
    userName: string;
    courseId: number;
    courseTitle: string;
    enrolledAt: string; // ISO 8601
    completedAt?: string | null; // ISO 8601
    status: 'active' | 'completed' | 'dropped';
    progressPercentage: number;
}

export interface LessonProgressDto {
    id: number;
    userId: string;
    lessonId: number;
    lessonName: string;
    isCompleted: boolean;
    completionDate: string | null; // ISO 8601
}


// =================================================================
// --- API Payloads ---
// =================================================================

export interface CreateCoursePayload {
    title: string;
    description?: string;
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}

export interface UpdateCourseCoordinatorDtoFE {
    title: string;
    description?: string;
    estimatedTime: number;
    categoryId: string;
    technologyIds: string[];
}

export interface CreateLessonPayload {
    courseId: number;
    lessonName: string;
    lessonPoints?: number;
}

export interface UpdateLessonPayload {
    lessonName: string;
    lessonPoints?: number;
}

export interface MarkLessonCompletedPayload {
    lessonId: number;
}

export interface CreateEnrollmentPayload {
    userId: string;
    courseId: number;
    status?: string;
}

export interface UpdateEnrollmentPayload {
    status: string;
}

export interface GenerateCertificatePayload {
    courseId: number;
}

export interface ExternalCertificateFormData {
    title: string;
    issuer: string;
    platform: string;
    completionDate: string;
    credentialUrl?: string;
    credentialId?: string;
    description?: string;
}

export interface AddExternalCertificatePayload extends ExternalCertificateFormData {}


// =================================================================
// --- API & Stats DTOs ---
// =================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface OverallLmsStatsDto {
    totalCategories: number;
    totalPublishedCourses: number;
    totalActiveLearners: number;
    totalActiveCoordinators: number;
    totalProjectManagers: number;
    averageCourseDurationOverall: string;
}


// =================================================================
// --- Frontend-Specific State Management Types ---
// =================================================================

// NEW: Added missing types for form dropdowns
export interface CategoryOption {
    id: string;
    title: string;
}

export interface TechnologyOption {
    id: string;
    name: string;
}


export interface BasicCourseDetailsState {
    title: string;
    description: string;
    estimatedTime: string; // Stored as string for input field binding
    categoryId: string;
    technologies: string[]; // Stores technology IDs
    thumbnail: File | null;
}

export interface SubtopicFE {
    id: number; // Corresponds to Lesson ID
    lessonName: string;
    lessonPoints?: number;
    courseId: number;
    documents: CourseDocumentDto[];
    isEditing?: boolean;
    originalName?: string;
    originalPoints?: number;
    isNew?: boolean; // ADDED: Flag to identify newly added subtopics on the frontend
}

export interface CourseContextState {
    createdCourseId: number | null;
    basicDetails: BasicCourseDetailsState;
    lessons: SubtopicFE[];
    lessonsLoaded: boolean;
}


// =================================================================
// --- UI & Brand Guideline Constants ---
// =================================================================

export const BRAND_COLORS = {
    russianViolet: '#1B0A3F',
    indigo: '#52007C',
    phlox: '#BF4BF6',
    white: '#FFFFFF',
    heliotrope: '#D68BF9',
    palePurple: '#F6E6FF',
    frenchViolet: '#7A00B8',
    persianIndigo: '#34137C',
    deepSkyBlue: '#00BFFF',
    federalBlue: '#03045e',
    gunmetal: '#292f36',
    black: '#030301',
    paynesGray: '#586574',
    timberwolf: '#D6D6D6',
    mediumBlue: '#0609C6',
    paleAzure: '#70DBFF'
} as const;

export const CERTIFICATE_PLATFORMS = [
    'Udemy', 'Coursera', 'edX', 'LinkedIn Learning', 'Pluralsight',
    'Khan Academy', 'FreeCodeCamp', 'Codecademy', 'Google Cloud Skills Boost',
    'AWS Training', 'Microsoft Learn', 'IBM SkillsBuild', 'Oracle University',
    'Salesforce Trailhead', 'HubSpot Academy', 'Other'
] as const;


// =================================================================
// --- UI Component Props & Utility Types ---
// =================================================================

export interface CertificateCardProps {
    certificate: CombinedCertificateDto;
    onView?: (certificate: CombinedCertificateDto) => void;
    onEdit?: (certificate: ExternalCertificateDto) => void;
    onDelete?: (id: string | number) => void;
    showActions?: boolean;
}

export type CertificateType = 'internal' | 'external';
export type CertificateFilter = 'all' | 'internal' | 'external';


// =================================================================
// --- Type Guards & Helper Functions ---
// =================================================================

export const isInternalCertificate = (cert: CombinedCertificateDto): cert is CertificateDto => {
    return cert.type === 'internal';
};

export const isExternalCertificate = (cert: CombinedCertificateDto): cert is ExternalCertificateDto => {
    return cert.type === 'external';
};