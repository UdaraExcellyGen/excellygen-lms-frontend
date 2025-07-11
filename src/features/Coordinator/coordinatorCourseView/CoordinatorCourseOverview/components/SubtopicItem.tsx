// src/features/Coordinator/coordinatorCourseView/CoordinatorCourseOverview/components/SubtopicItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash, Download, Plus, Video, FileText, List } from 'lucide-react';
import { LessonDto, CourseDocumentDto } from '../../../../../types/course.types';
import { getQuizzesByLessonId } from '../../../../../api/services/Course/quizService';
import QuizList from './QuizList';
import { QuizDto } from '../../../../../types/quiz.types';

interface SubtopicItemProps {
  lesson: LessonDto;
  isEditMode: boolean;
  editData?: { lessonName: string; lessonPoints: number };
  onEditNameChange: (lessonId: number, newName: string) => void;
  onEditPointsChange: (lessonId: number, newPoints: number) => void;
  onRemoveSubtopic: (lessonId: number, lessonName: string) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  materials: CourseDocumentDto[];
  quizzes: any[]; // We'll replace this with actual quiz data
  onDeleteMaterial: (documentId: number, lessonId: number, name: string) => void;
  onAddMaterial: (lessonId: number) => void;
  onCancelDocumentUpload: (lessonId: number) => void;
  onDocumentFileChange: (event: React.ChangeEvent<HTMLInputElement>, lessonId: number) => void;
  newDocumentFile: File | null;
  isUploadingDoc: boolean;
  onAddVideo: (lessonId: number) => void;
  onCreateQuiz: (lessonId: number) => void;
  onEditQuiz: (lessonId: number) => void;
  onRemoveQuiz: (lessonId: number) => void;
  isSaving: boolean;
  lessonPointsDisplay: number;
}

const SubtopicItem: React.FC<SubtopicItemProps> = ({
  lesson,
  isEditMode,
  editData,
  onEditNameChange,
  onEditPointsChange,
  onRemoveSubtopic,
  isExpanded,
  toggleExpand,
  materials,
  quizzes: propQuizzes, // Quizzes from props (might be outdated)
  onDeleteMaterial,
  onAddMaterial,
  onCancelDocumentUpload,
  onDocumentFileChange,
  newDocumentFile,
  isUploadingDoc,
  onAddVideo,
  onCreateQuiz,
  onEditQuiz,
  onRemoveQuiz,
  isSaving,
  lessonPointsDisplay,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actualQuizzes, setActualQuizzes] = useState<QuizDto[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Guard clause
  if (!lesson || typeof lesson.id === 'undefined') {
    console.error("SubtopicItem received invalid lesson data:", lesson);
    return null;
  }

  // Load actual quizzes from API when expanded
  useEffect(() => {
    if (isExpanded && lesson?.id) {
      setLoadingQuizzes(true);
      getQuizzesByLessonId(lesson.id)
        .then(fetchedQuizzes => {
          console.log(`Loaded ${fetchedQuizzes.length} quizzes for lesson ${lesson.id}:`, fetchedQuizzes);
          setActualQuizzes(fetchedQuizzes || []);
        })
        .catch(error => {
          console.error(`Failed to load quizzes for lesson ${lesson.id}:`, error);
          setActualQuizzes([]);
        })
        .finally(() => {
          setLoadingQuizzes(false);
        });
    }
  }, [isExpanded, lesson?.id]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const hasQuizzes = actualQuizzes.length > 0;
  const materialsList = materials || [];

  return (
    <div className="bg-[#1B0A3F]/50 rounded-lg mb-4 overflow-hidden">
      {/* Subtopic Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer" 
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronUp className="text-[#D68BF9] w-5 h-5" />
          ) : (
            <ChevronDown className="text-[#D68BF9] w-5 h-5" />
          )}
          <div className="flex-1">
            {isEditMode ? (
              <input
                type="text"
                value={editData?.lessonName || lesson.lessonName}
                onChange={(e) => onEditNameChange(lesson.id, e.target.value)}
                className="bg-[#34137C]/60 text-white px-3 py-1 rounded-md border border-[#BF4BF6]/30 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter lesson name"
              />
            ) : (
              <h3 className="text-white font-medium">{lesson.lessonName}</h3>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-[#34137C]/60 px-2 py-1 rounded text-white text-xs flex items-center">
            <span className="mr-1">Points:</span>
            {isEditMode ? (
              <input
                type="number"
                min="1"
                max="100"
                value={editData?.lessonPoints ?? lesson.lessonPoints}
                onChange={(e) => onEditPointsChange(lesson.id, parseInt(e.target.value, 10))}
                className="bg-[#34137C] text-white w-12 px-1 rounded border border-[#BF4BF6]/30"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{lessonPointsDisplay}</span>
            )}
          </div>
          {isEditMode && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSubtopic(lesson.id, lesson.lessonName);
              }} 
              className="text-red-400 hover:text-red-300"
              disabled={isSaving}
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Materials Section */}
          <div className="mb-4">
            <h4 className="text-[#D68BF9] text-sm mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Documents ({materialsList.length})
            </h4>
            <div className="space-y-2">
              {materialsList.length > 0 ? (
                materialsList.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="bg-[#34137C]/30 p-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
                      <span className="text-white text-sm">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#D68BF9] hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                        download={doc.name}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {isEditMode && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMaterial(doc.id, lesson.id, doc.name);
                          }} 
                          className="text-red-400 hover:text-red-300"
                          disabled={isSaving}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">No documents uploaded</p>
              )}

              {/* Upload Form */}
              {isEditMode && (
                <div className="mt-3">
                  {newDocumentFile ? (
                    <div className="flex items-center mt-2">
                      <span className="text-white text-sm mr-2 truncate max-w-xs">
                        {newDocumentFile.name}
                      </span>
                      <button 
                        onClick={() => onAddMaterial(lesson.id)} 
                        className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-xs py-1 px-2 rounded mr-2"
                        disabled={isUploadingDoc}
                      >
                        {isUploadingDoc ? 'Uploading...' : 'Upload'}
                      </button>
                      <button 
                        onClick={() => onCancelDocumentUpload(lesson.id)} 
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded"
                        disabled={isUploadingDoc}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={handleFileButtonClick} 
                        className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center"
                        disabled={isSaving}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Document
                      </button>
                      <button 
                        onClick={() => onAddVideo(lesson.id)} 
                        className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center"
                        disabled={isSaving}
                      >
                        <Video className="w-3 h-3 mr-1" />
                        Add Video
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => onDocumentFileChange(e, lesson.id)}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quizzes Section */}
          <div>
            <h4 className="text-[#D68BF9] text-sm mb-2 flex items-center">
              <List className="w-4 h-4 mr-1" />
              Quizzes {loadingQuizzes ? '(Loading...)' : `(${actualQuizzes.length})`}
            </h4>

            <div className="space-y-2">
              {hasQuizzes ? (
                actualQuizzes.map((quiz) => (
                  <QuizList
                      quizzes={actualQuizzes}
                      handleEditQuiz={() => onEditQuiz(lesson.id)}
                    />
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">
                  {loadingQuizzes ? 'Loading quizzes...' : 'No quizzes created yet'}
                </p>
              )}

              {/* Create Quiz Button */}
              {isEditMode && !hasQuizzes && !loadingQuizzes && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateQuiz(lesson.id);
                  }} 
                  className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center mt-2"
                  disabled={isSaving}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtopicItem;