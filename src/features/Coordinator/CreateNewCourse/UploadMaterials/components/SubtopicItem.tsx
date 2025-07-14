// src/features/Coordinator/CreateNewCourse/UploadMaterials/components/SubtopicItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash, Download, Plus, Video, FileText, List, Edit3, Upload, X } from 'lucide-react';
import { SubtopicFE, ExistingMaterialFile } from '../../../../../types/course.types';
import { QuizDto } from '../../../../../types/quiz.types';
import { getQuizzesByLessonId } from '../../../../../api/services/Course/quizService';

interface SubtopicItemProps {
  subtopic: SubtopicFE;
  expanded: boolean;
  pendingFiles: File[];
  errorMessage?: string;
  showUploadSection: boolean;
  isSubmitting: boolean;
  toggleSubtopic: () => void;
  handleRemoveSubtopic: () => void;
  handleSubtopicInputChange: (field: 'lessonName' | 'lessonPoints', value: string) => void;
  handleToggleEdit: () => void;
  handleSaveChanges: () => void;
  handleCancelEdit: () => void;
  removeMaterial: (docId: number, docName: string) => void;
  handleUploadDocumentClick: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadPendingFiles: () => void;
  handleRemovePendingFile: (fileName: string) => void;
  setIsDraggingDocs: (isDragging: boolean) => void;
  isDraggingDocs: boolean;
  handleAddVideoClick: () => void;
  handleCreateQuizClick: () => void;
  handleEditQuiz: () => void;
  handleRemoveQuiz: () => void;
}

const SubtopicItem: React.FC<SubtopicItemProps> = ({
  subtopic,
  expanded,
  pendingFiles,
  errorMessage,
  showUploadSection,
  isSubmitting,
  toggleSubtopic,
  handleRemoveSubtopic,
  handleSubtopicInputChange,
  handleToggleEdit,
  handleSaveChanges,
  handleCancelEdit,
  removeMaterial,
  handleUploadDocumentClick,
  handleDrop,
  handleFileSelect,
  handleUploadPendingFiles,
  handleRemovePendingFile,
  setIsDraggingDocs,
  isDraggingDocs,
  handleAddVideoClick,
  handleCreateQuizClick,
  handleEditQuiz,
  handleRemoveQuiz,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Load quizzes when subtopic expands
  useEffect(() => {
    if (expanded && subtopic?.id) {
      setLoadingQuizzes(true);
      getQuizzesByLessonId(subtopic.id)
        .then(fetchedQuizzes => {
          setQuizzes(fetchedQuizzes || []);
        })
        .catch(error => {
          console.error(`Failed to load quizzes for lesson ${subtopic.id}:`, error);
          setQuizzes([]);
        })
        .finally(() => {
          setLoadingQuizzes(false);
        });
    }
  }, [expanded, subtopic?.id]);

  // Guard clause
  if (!subtopic || typeof subtopic.id === 'undefined') {
    console.error("SubtopicItem received invalid subtopic data:", subtopic);
    return null;
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingDocs(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingDocs(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const hasQuizzes = quizzes.length > 0;
  const materialsList = subtopic.documents || [];

  return (
    <div className="bg-white/90 rounded-lg mb-4 overflow-hidden ">
      {/* Subtopic Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer" 
        onClick={toggleSubtopic}
      >
        <div className="flex items-center space-x-3">
          {expanded ? (
            <ChevronUp className="text-[#52007C] w-5 h-5" />
          ) : (
            <ChevronDown className="text-[#52007C] w-5 h-5" />
          )}
          <div className="flex-1">
            {subtopic.isEditing ? (
              <input
                type="text"
                value={subtopic.lessonName}
                onChange={(e) => handleSubtopicInputChange('lessonName', e.target.value)}
                className=" text-[#1B0A3F] px-3 py-1 rounded-md border-2 border-[#52007C] w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter subtopic name"
              />
            ) : (
              <h3 className="text-[#1B0A3F] font-medium">{subtopic.lessonName}</h3>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="border border-[#52007C] px-2 py-1 rounded text-[#1B0A3F] text-xs flex items-center">
            <span className="mr-1">Points:</span>
            {subtopic.isEditing ? (
              <input
                type="number"
                min="1"
                max="100"
                value={subtopic.lessonPoints}
                onChange={(e) => handleSubtopicInputChange('lessonPoints', e.target.value)}
                className=" text-[#1B0A3F] w-12 px-1 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{subtopic.lessonPoints}</span>
            )}
          </div>
          {subtopic.isEditing ? (
            <div className="flex items-center space-x-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveChanges();
                }} 
                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border-2 border-gray-800/30 rounded"
                disabled={isSubmitting}
              >
                Save
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }} 
                className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 border-2 border border-gray-800/30 rounded"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEdit();
                }} 
                className="text-[#DA70D6] hover:text-[#D68BF9]"
                disabled={isSubmitting}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSubtopic();
                }} 
                className="text-red-500 hover:text-red-400"
                disabled={isSubmitting}
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Documents Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[#D68BF9] text-sm flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Documents ({materialsList.length})
              </h4>
              <button 
                onClick={handleUploadDocumentClick} 
                className="border-2 border border-[#34137C] hover:border-[#34137C]/60 text-[#BF4BF6] text-xs py-1 px-2 rounded flex items-center"
                disabled={isSubmitting}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Document
              </button>
            </div>
            
            {/* Existing Documents */}
            <div className="space-y-2 mb-3">
              {materialsList.length > 0 ? (
                materialsList.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="bg-[#52007C]/20 p-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-[#52007C] mr-2" />
                      <span className="text-[#52007C] text-sm">{doc.name}</span>
                      <span className="text-gray-800 text-xs ml-2">
                        ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#52007C] hover:text-[#52007C]/80"
                        download={doc.name}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => removeMaterial(doc.id, doc.name)} 
                        className="text-red-500 hover:text-red-400"
                        disabled={isSubmitting}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">No documents uploaded yet</p>
              )}
            </div>

            {/* Upload area */}
            {showUploadSection && (
              <div className="border border-[#BF4BF6]/30 rounded-lg p-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDraggingDocs 
                      ? 'border-[#D68BF9] bg-[#D68BF9]/10' 
                      : 'border-[#BF4BF6]/50 hover:border-[#D68BF9]'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-[#BF4BF6] mx-auto mb-2" />
                  <p className="text-[#1B0A3F]/80 text-sm mb-2">
                    Drag and drop files here or{' '}
                    <button 
                      onClick={handleFileButtonClick}
                      className="text-[#BF4BF6]  hover:text-[#BF4BF6]/80"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Supported: PDF, DOC, DOCX (Max 5MB each)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    multiple
                  />
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mt-3 p-2 bg-white border border-red-500/30 rounded text-red-500 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Pending Files */}
                {pendingFiles.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-[#1B0A3F] text-sm mb-2">Pending Files:</h5>
                    <div className="space-y-1">
                      {pendingFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#1B0A3F]/20 p-2 rounded">
                          <span className="text-[#1B0A3F]/60 text-sm truncate flex-1">{file.name}</span>
                          <button 
                            onClick={() => handleRemovePendingFile(file.name)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button 
                        onClick={() => handleUploadPendingFiles()}
                        className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-white text-sm py-1 px-3 rounded"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Uploading...' : `Upload ${pendingFiles.length} File(s)`}
                      </button>
                      <button 
                        onClick={handleUploadDocumentClick}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {/* <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={handleAddVideoClick} 
              className="border-2 border border-[#34137C] hover:border-[#34137C]/60 text-[#BF4BF6] text-xs py-1 px-2 rounded flex items-center"
              disabled={isSubmitting}
            >
              <Video className="w-3 h-3 mr-1" />
              Add Video
            </button>
          </div> */}

          {/* Quizzes Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[#D68BF9] text-sm flex items-center">
                <List className="w-4 h-4 mr-1" />
                Quizzes {loadingQuizzes ? '(Loading...)' : `(${quizzes.length})`}
              </h4>
              {!hasQuizzes && (
                <button 
                  onClick={handleCreateQuizClick}
                  className="border-2 border border-[#34137C] hover:border-[#34137C]/60 text-[#BF4BF6] text-xs py-1 px-2 rounded flex items-center"
                  disabled={isSubmitting}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Create Quiz
                </button>
              )}
            </div>

            <div className="space-y-2">
              {hasQuizzes ? (
                quizzes.map((quiz) => (
                  <div 
                    key={quiz.quizId} 
                    className="bg-[#52007C]/20 p-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <List className="w-4 h-4 text-[#52007C] mr-2" />
                      <span className="text-[#52007C] text-sm">{quiz.quizTitle}</span>
                      <span className="text-gray-800 text-xs ml-2">
                        ({quiz.quizSize} questions • {quiz.timeLimitMinutes} min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleEditQuiz}
                        className="text-[#52007C] hover:text-[#52007C]/80"
                        disabled={isSubmitting}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleRemoveQuiz}
                        className="text-red-500 hover:text-red-400"
                        disabled={isSubmitting}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">
                  {loadingQuizzes ? 'Loading quizzes...' : 'No quizzes created yet'}
                </p>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={handleAddVideoClick} 
              className="border-2 border border-[#34137C] hover:border-[#34137C]/60 text-[#BF4BF6] text-xs py-1 px-2 rounded flex items-center"
              disabled={isSubmitting}
            >
              <Video className="w-3 h-3 mr-1" />
              Add Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtopicItem;