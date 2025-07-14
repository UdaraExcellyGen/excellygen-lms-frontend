// types/course.types.ts - Complete Updated Types with ExcellyGen Brand Guidelines

// === EXISTING COURSE TYPES ===
export interface CourseDto {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  category: CourseCategoryDto;
  creatorId: string;
  creator: UserDto;
  status: CourseStatus;
  thumbnailImagePath?: string;
  createdAt: string;
  updatedAt: string;
  lessons?: LessonDto[];
  technologies?: TechnologyDto[];
}

export interface LessonDto {
  id: number;
  courseId: number;
  lessonName: string;
  lessonOrder: number;
  content?: string;
  videoUrl?: string;
  documents?: CourseDocumentDto[];
}

// Enhanced LearnerLessonDto with quiz completion tracking
export interface LearnerLessonDto {
  id: number;
  courseId: number;
  lessonName: string;
  lessonOrder: number;
  content?: string;
  videoUrl?: string;
  documents?: CourseDocumentDto[];
  isCompleted: boolean;
  hasQuiz: boolean;
  quizId?: number;
  isQuizCompleted: boolean;
  lastAttemptId?: number;
}

export interface CourseDocumentDto {
  id: number;
  lessonId: number;
  name: string;
  filePath: string;
  fileUrl: string;
  documentType: DocumentType;
  uploadedAt: string;
}

export interface CourseCategoryDto {
  id: string;
  name: string;
  title: string; // Added for compatibility
  description?: string;
  iconName?: string;
  isActive: boolean;
}

export interface TechnologyDto {
  id: number;
  name: string;
  description?: string;
  status: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface LearnerCourseDto {
  id: number;
  title: string;
  description: string;
  category: CourseCategoryDto;
  creator: UserDto;
  status: CourseStatus;
  thumbnailImagePath?: string;
  thumbnailUrl?: string; // Added for compatibility
  enrollmentStatus: 'active' | 'completed' | 'inactive';
  progressPercentage: number;
  enrolledAt?: string;
  completedAt?: string;
  lessons: LearnerLessonDto[]; // Updated to use LearnerLessonDto
  technologies: TechnologyDto[];
  totalLessons: number;
  completedLessons: number;
  estimatedTime: number;
}

export interface LessonProgressDto {
  id: number;
  userId: string;
  lessonId: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface MarkLessonCompletedPayload {
  lessonId: number;
}

export enum CourseStatus {
  Draft = 'Draft',
  Published = 'Published',
  Archived = 'Archived'
}

export enum DocumentType {
  PDF = 'PDF',
  Video = 'Video',
  PowerPoint = 'PowerPoint',
  Word = 'Word',
  Excel = 'Excel',
  Other = 'Other'
}

// === CERTIFICATE TYPES ===

// Internal Certificate (from LMS courses)
export interface CertificateDto {
  id: number;
  title: string;
  courseTitle: string;
  userName: string;
  completionDate: string;
  certificateFileUrl?: string;
  type: 'internal'; // Add type to distinguish
  userId: string;
  courseId: number;
}

// External Certificate (from other platforms)
export interface ExternalCertificateDto {
  id: string;
  title: string;
  issuer: string; // Udemy, Coursera, etc.
  platform: string;
  completionDate: string;
  credentialUrl?: string;
  credentialId?: string;
  description?: string;
  imageUrl?: string;
  type: 'external'; // Add type to distinguish
  userName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Combined Certificate Type
export type CombinedCertificateDto = CertificateDto | ExternalCertificateDto;

// External Certificate Form Data
export interface ExternalCertificateFormData {
  title: string;
  issuer: string;
  platform: string;
  completionDate: string;
  credentialUrl?: string;
  credentialId?: string;
  description?: string;
}

// Generate Certificate Payload (for internal certificates)
export interface GenerateCertificatePayload {
  courseId: number;
}

// Add External Certificate Payload
export interface AddExternalCertificatePayload extends ExternalCertificateFormData {
  // Inherits all fields from ExternalCertificateFormData
}

// === BRAND COLORS FROM EXCELLYGEN GUIDELINES ===
export const BRAND_COLORS = {
  // Primary Colors
  russianViolet: '#1B0A3F',
  indigo: '#52007C',
  phlox: '#BF4BF6',
  white: '#FFFFFF',
  heliotrope: '#D68BF9',
  palePurple: '#F6E6FF',
  frenchViolet: '#7A00B8',
  persianIndigo: '#34137C',
  
  // Secondary Colors
  deepSkyBlue: '#00BFFF',
  federalBlue: '#03045e',
  gunmetal: '#292f36',
  black: '#030301',
  paynesGray: '#586574',
  timberwolf: '#D6D6D6',
  mediumBlue: '#0609C6',
  paleAzure: '#70DBFF'
} as const;

// === CERTIFICATE PLATFORMS ===
export const CERTIFICATE_PLATFORMS = [
  'Udemy',
  'Coursera',
  'edX',
  'LinkedIn Learning',
  'Pluralsight',
  'Khan Academy',
  'FreeCodeCamp',
  'Codecademy',
  'Google Cloud Skills Boost',
  'AWS Training',
  'Microsoft Learn',
  'IBM SkillsBuild',
  'Oracle University',
  'Salesforce Trailhead',
  'HubSpot Academy',
  'Other'
] as const;

export type CertificatePlatform = typeof CERTIFICATE_PLATFORMS[number];

// === THEME CONFIGURATIONS ===
export const CERTIFICATE_THEMES = {
  internal: {
    // FIX: Wrapped template literals in backticks to form a valid string
    gradient: `linear-gradient(135deg, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.phlox})`,
    primaryColor: BRAND_COLORS.indigo,
    secondaryColor: BRAND_COLORS.heliotrope,
    backgroundColor: BRAND_COLORS.palePurple,
    badgeColor: `${BRAND_COLORS.phlox}15`,
    textColor: BRAND_COLORS.frenchViolet
  },
  external: {
    // FIX: Wrapped template literals in backticks to form a valid string
    gradient: `linear-gradient(135deg, ${BRAND_COLORS.federalBlue}, ${BRAND_COLORS.mediumBlue})`,
    primaryColor: BRAND_COLORS.federalBlue,
    secondaryColor: BRAND_COLORS.paleAzure,
    backgroundColor: `${BRAND_COLORS.deepSkyBlue}15`,
    badgeColor: `${BRAND_COLORS.deepSkyBlue}15`,
    textColor: BRAND_COLORS.federalBlue
  }
} as const;

// === FONT CONFIGURATIONS (FROM BRAND GUIDELINES) ===
export const BRAND_FONTS = {
  primary: 'Unbounded', // Primary font
  secondary: 'Nunito Sans', // Secondary font
  weights: {
    regular: 400,
    medium: 500,
    bold: 700
  }
} as const;

// === QUIZ TYPES (EXISTING) ===
export interface QuizDto {
  quizId: number;
  lessonId: number;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  isActive: boolean;
  questions: QuizQuestionDto[];
}

export interface QuizQuestionDto {
  questionId: number;
  questionText: string;
  questionType: 'MultipleChoice' | 'TrueFalse' | 'ShortAnswer';
  points: number;
  options: QuizOptionDto[];
}

export interface QuizOptionDto {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuizAttemptDto {
  attemptId: number;
  quizId: number;
  userId: string;
  score: number;
  totalScore: number;
  percentage: number;
  isPassing: boolean;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswerDto[];
}

export interface QuizAnswerDto {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

// === ENROLLMENT TYPES (EXISTING) ===
export interface EnrollmentDto {
  id: number;
  userId: string;
  courseId: number;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  progressPercentage: number;
  completedAt?: string;
}

// === API RESPONSE TYPES ===
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

// === FORM VALIDATION TYPES ===
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// === UI COMPONENT PROPS ===
export interface CertificateCardProps {
  certificate: CombinedCertificateDto;
  onView?: (certificate: CombinedCertificateDto) => void;
  onEdit?: (certificate: ExternalCertificateDto) => void;
  onDelete?: (id: string | number) => void;
  showActions?: boolean;
}

export interface CertificateFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface CertificateStatsProps {
  totalCertificates: number;
  internalCertificates: number;
  externalCertificates: number;
  coursesInProgress: number;
}

// === UTILITY TYPES ===
export type CertificateType = 'internal' | 'external';
export type CertificateFilter = 'all' | 'internal' | 'external';

// Helper function to check certificate type
export const isInternalCertificate = (cert: CombinedCertificateDto): cert is CertificateDto => {
  return cert.type === 'internal';
};

export const isExternalCertificate = (cert: CombinedCertificateDto): cert is ExternalCertificateDto => {
  return cert.type === 'external';
};

// Helper function to get certificate theme
export const getCertificateTheme = (type: CertificateType) => {
  return CERTIFICATE_THEMES[type];
};

// Helper function to format certificate date
export const formatCertificateDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to get platform icon color
export const getPlatformIconColor = (platform: string): string => {
  const platformColors: Record<string, string> = {
    'Udemy': '#EC5252',
    'Coursera': '#0056D3',
    'edX': '#02262B',
    'LinkedIn Learning': '#0077B5',
    'Pluralsight': '#F15B2A',
    'Khan Academy': '#14BF96',
    'FreeCodeCamp': '#0A0A23',
    'Codecademy': '#1F4056',
    'Google Cloud Skills Boost': '#4285F4',
    'AWS Training': '#FF9900',
    'Microsoft Learn': '#00BCF2',
    'IBM SkillsBuild': '#1261FE',
    'Oracle University': '#F80000',
    'Salesforce Trailhead': '#00A1E0',
    'HubSpot Academy': '#FF7A59'
  };
  
  return platformColors[platform] || BRAND_COLORS.federalBlue;
};