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
    <div className="bg-[#1B0A3F]/50 rounded-lg mb-4 overflow-hidden">
      {/* Subtopic Header */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer" 
        onClick={toggleSubtopic}
      >
        <div className="flex items-center space-x-3">
          {expanded ? (
            <ChevronUp className="text-[#D68BF9] w-5 h-5" />
          ) : (
            <ChevronDown className="text-[#D68BF9] w-5 h-5" />
          )}
          <div className="flex-1">
            {subtopic.isEditing ? (
              <input
                type="text"
                value={subtopic.lessonName}
                onChange={(e) => handleSubtopicInputChange('lessonName', e.target.value)}
                className="bg-[#34137C]/60 text-white px-3 py-1 rounded-md border border-[#BF4BF6]/30 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter subtopic name"
              />
            ) : (
              <h3 className="text-white font-medium">{subtopic.lessonName}</h3>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-[#34137C]/60 px-2 py-1 rounded text-white text-xs flex items-center">
            <span className="mr-1">Points:</span>
            {subtopic.isEditing ? (
              <input
                type="number"
                min="1"
                max="100"
                value={subtopic.lessonPoints}
                onChange={(e) => handleSubtopicInputChange('lessonPoints', e.target.value)}
                className="bg-[#34137C] text-white w-12 px-1 rounded border border-[#BF4BF6]/30"
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
                className="text-green-400 hover:text-green-300 text-xs px-2 py-1 bg-green-800/30 rounded"
                disabled={isSubmitting}
              >
                Save
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }} 
                className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 bg-gray-800/30 rounded"
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
                className="text-[#D68BF9] hover:text-white"
                disabled={isSubmitting}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSubtopic();
                }} 
                className="text-red-400 hover:text-red-300"
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
                className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center"
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
                    className="bg-[#34137C]/30 p-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-[#D68BF9] mr-2" />
                      <span className="text-white text-sm">{doc.name}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#D68BF9] hover:text-white"
                        download={doc.name}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => removeMaterial(doc.id, doc.name)} 
                        className="text-red-400 hover:text-red-300"
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

            {/* Upload Section */}
            {showUploadSection && (
              <div className="bg-[#34137C]/20 border border-[#BF4BF6]/30 rounded-lg p-4">
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
                  <Upload className="w-8 h-8 text-[#D68BF9] mx-auto mb-2" />
                  <p className="text-white text-sm mb-2">
                    Drag and drop files here or{' '}
                    <button 
                      onClick={handleFileButtonClick}
                      className="text-[#D68BF9] underline hover:text-white"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-gray-400 text-xs">
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
                  <div className="mt-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Pending Files */}
                {pendingFiles.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-white text-sm mb-2">Pending Files:</h5>
                    <div className="space-y-1">
                      {pendingFiles.map((file, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#1B0A3F]/50 p-2 rounded">
                          <span className="text-white text-sm truncate flex-1">{file.name}</span>
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
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={handleAddVideoClick} 
              className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center"
              disabled={isSubmitting}
            >
              <Video className="w-3 h-3 mr-1" />
              Add Video
            </button>
          </div>

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
                  className="bg-[#34137C] hover:bg-[#34137C]/80 text-[#D68BF9] text-xs py-1 px-2 rounded flex items-center"
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
                    className="bg-[#34137C]/30 p-2 rounded-md flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <List className="w-4 h-4 text-[#D68BF9] mr-2" />
                      <span className="text-white text-sm">{quiz.quizTitle}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        ({quiz.quizSize} questions • {quiz.timeLimitMinutes} min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleEditQuiz}
                        className="text-[#D68BF9] hover:text-white"
                        disabled={isSubmitting}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleRemoveQuiz}
                        className="text-red-400 hover:text-red-300"
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
        </div>
      )}
    </div>
  );
};

export default SubtopicItem;