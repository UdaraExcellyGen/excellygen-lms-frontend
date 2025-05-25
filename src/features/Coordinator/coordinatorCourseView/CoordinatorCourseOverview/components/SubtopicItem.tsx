// features/Mainfolder/CoordinatorCourseOverview/components/SubtopicItem.tsx
import React, { useState } from 'react';
import { ChevronDown, X, FileText, Plus, Upload, Edit, Save, XCircle, Trash2 } from 'lucide-react';
import { LessonDto, CourseDocumentDto, QuizDto } from '../../../../../types/course.types';

// Import MaterialList and QuizList
import MaterialList from './MaterialList';
import QuizList from './QuizList';

// Assuming EditSubtopicData is defined in CoordinatorCourseOverview.tsx
interface EditSubtopicData {
    lessonName: string;
    lessonPoints: number;
}

interface SubtopicItemProps {
    lesson: LessonDto & { quizzes?: QuizDto[] }; // Full LessonDto with optional quizzes
    isEditMode: boolean;
    editData: EditSubtopicData; // Data from parent's edit state for this lesson
    onEditNameChange: (lessonId: number, newName: string) => void;
    onEditPointsChange: (lessonId: number, newPoints: number) => void;
    onRemoveSubtopic: (lessonId: number, lessonName: string) => void;
    isExpanded: boolean;
    toggleExpand: (lessonId: number) => void;
    materials: CourseDocumentDto[]; // Documents for this lesson
    quizzes: QuizDto[]; // Quizzes for this lesson
    onDeleteMaterial: (documentId: number, lessonId: number, documentName: string) => void;
    onAddMaterial: (lessonId: number) => Promise<void>; // Function to add a new document
    onCancelDocumentUpload: (lessonId: number) => void; // Function to cancel pending doc upload
    onDocumentFileChange: (e: React.ChangeEvent<HTMLInputElement>, lessonId: number) => void;
    newDocumentFile: File | null; // The file currently selected for upload for this lesson
    isUploadingDoc: boolean; // Flag to show "Uploading..." state
    onAddVideo: (lessonId: number) => void;
    onCreateQuiz: (lessonId: number) => void;
    onEditQuiz: (lessonId: number) => void;
    onRemoveQuiz: (lessonId: number) => void;
    isSaving: boolean; // General saving state from parent
    lessonPointsDisplay: number; // Calculated points for display
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
    quizzes,
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
    lessonPointsDisplay
}) => {
    const hasQuiz = quizzes && quizzes.length > 0;
    const [showDocumentUpload, setShowDocumentUpload] = useState(false); // Local state for document upload section
    const [isDraggingDoc, setIsDraggingDoc] = useState(false); // Local drag state for documents

    const handlePointsInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*$/.test(value)) { // Allow empty string or numbers
            onEditPointsChange(lesson.id, value === '' ? 0 : parseInt(value, 10));
        }
    };

    const handlePointsInputBlurEvent = () => {
        let points = editData.lessonPoints;
        if (isNaN(points) || points < 1) {
            points = 1;
        } else if (points > 100) {
            points = 100;
        }
        onEditPointsChange(lesson.id, points);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingDoc(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(e.dataTransfer.files[0]);
            onDocumentFileChange({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>, lesson.id);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDocumentFileChange(e, lesson.id);
    };


    return (
        <div className="bg-[#2D1B59] rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out">
            {/* Header for Subtopic */}
            <button
                onClick={() => toggleExpand(lesson.id)}
                className="w-full flex items-center justify-between p-4 bg-[#2D1B59] hover:bg-[#3d2466] transition-colors text-white text-left"
                aria-expanded={isExpanded}
                disabled={isSaving}
            >
                <div className="flex items-center flex-grow min-w-0">
                    {isEditMode ? (
                        <input
                            type="text"
                            value={editData.lessonName || ''}
                            onChange={(e) => onEditNameChange(lesson.id, e.target.value)}
                            className="flex-grow p-2 bg-[#1B0A3F] border border-[#BF4BF6]/50 rounded text-white font-unbounded text-base focus:outline-none focus:border-[#BF4BF6] min-w-0"
                            disabled={isSaving}
                            placeholder="Lesson Name"
                        />
                    ) : (
                        <h4 className="font-unbounded text-lg text-white truncate pr-4">
                            {lesson.lessonName}
                            {hasQuiz && (
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                    Quiz
                                </span>
                            )}
                        </h4>
                    )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {isEditMode ? (
                        <>
                            <label htmlFor={`points-${lesson.id}`} className="text-sm text-gray-300 whitespace-nowrap">Points:</label>
                            <input
                                type="number"
                                id={`points-${lesson.id}`}
                                min="1"
                                max="100"
                                value={editData.lessonPoints === 0 ? '' : editData.lessonPoints}
                                onChange={handlePointsInputChangeEvent}
                                onBlur={handlePointsInputBlurEvent}
                                className="w-16 p-1 text-sm bg-[#1B0A3F] text-white rounded border border-[#BF4BF6]/50 text-center focus:outline-none focus:border-[#BF4BF6]"
                                disabled={isSaving}
                            />
                            <button
                                onClick={() => onRemoveSubtopic(lesson.id, lesson.lessonName)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                disabled={isSaving}
                                aria-label={`Delete ${lesson.lessonName}`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </>
                    ) : (
                        <span className="text-sm text-[#D68BF9] px-3 py-1 rounded-full bg-[#34137C] whitespace-nowrap">
                            {lessonPointsDisplay} points
                        </span>
                    )}
                    <ChevronDown
                        className={`w-5 h-5 text-white transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="p-5 border-t border-[#3d2466] space-y-5">
                    {/* Documents List */}
                    <div className="bg-[#1B0A3F]/50 rounded-lg p-4 space-y-3">
                        <h5 className="text-sm font-semibold text-[#D68BF9] mb-2">Documents ({materials.length})</h5>
                        {materials.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No documents uploaded yet.</p>
                        ) : (
                            <MaterialList
                                materials={materials}
                                askDeleteConfirmation={onDeleteMaterial}
                            />
                        )}
                    </div>

                    {/* Quizzes List */}
                    <div className="bg-[#1B0A3F]/50 rounded-lg p-4 space-y-3">
                        <h5 className="text-sm font-semibold text-[#D68BF9] mb-2">Quizzes ({quizzes.length})</h5>
                        {quizzes.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No quiz created for this lesson yet.</p>
                        ) : (
                            <QuizList
                                quizzes={quizzes}
                                handleEditQuiz={() => onEditQuiz(lesson.id)} // Pass lesson.id
                            />
                        )}
                    </div>

                    {/* Action Buttons (Edit Mode) */}
                    {isEditMode && (
                        <div className="flex flex-wrap gap-3 mt-4">
                            <button
                                onClick={() => setShowDocumentUpload(prev => !prev)}
                                className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1"
                                disabled={isSaving || isUploadingDoc}
                            >
                                <Plus size={16} /> {showDocumentUpload ? 'Hide Upload' : 'Add Document'}
                            </button>
                            <button
                                onClick={() => onAddVideo(lesson.id)}
                                className="bg-gray-600 text-gray-300 font-bold py-2 px-4 rounded-full text-sm flex items-center gap-1 cursor-not-allowed"
                                disabled
                            >
                                <Plus size={16} /> Add Video
                            </button>
                            {!hasQuiz ? (
                                <button
                                    onClick={() => onCreateQuiz(lesson.id)}
                                    className="bg-[#BF4BF6] hover:bg-[#D68BF9] text-[#1B0A3F] font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1"
                                    disabled={isSaving}
                                >
                                    <Plus size={16} /> Create Quiz
                                </button>
                            ) : (
                                <button
                                    onClick={() => onRemoveQuiz(lesson.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm flex items-center gap-1"
                                    disabled={isSaving}
                                >
                                    <Trash2 size={16} /> Remove Quiz
                                </button>
                            )}
                        </div>
                    )}

                    {/* Document Upload Section */}
                    {isEditMode && showDocumentUpload && (
                        <div className="mt-5 bg-[#1B0A3F]/50 backdrop-blur-sm rounded-xl border border-[#BF4BF6]/30 shadow-inner p-5 space-y-4">
                            <h6 className="text-md font-semibold text-white mb-3">Upload New Document</h6>
                            <div
                                className={`border-2 border-dashed ${isDraggingDoc ? 'border-[#BF4BF6] bg-[#BF4BF6]/10' : 'border-gray-600/50'} rounded-lg p-6 text-center transition-colors`}
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingDoc(true); }}
                                onDragEnter={() => setIsDraggingDoc(true)}
                                onDragLeave={() => setIsDraggingDoc(false)}
                                onDrop={handleDrop}
                            >
                                <Upload size={32} className="text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-300">Drag & drop your document here or</p>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id={`document-upload-${lesson.id}`}
                                    disabled={isSaving || isUploadingDoc}
                                />
                                <label
                                    htmlFor={`document-upload-${lesson.id}`}
                                    className="mt-2 inline-block cursor-pointer text-base text-[#BF4BF6] hover:text-[#D68BF9] transition-colors underline"
                                >
                                    Click to upload
                                </label>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                                {newDocumentFile && (
                                    <p className="text-sm text-[#D68BF9] mt-3">{newDocumentFile.name} selected</p>
                                )}
                            </div>
                            {newDocumentFile && (
                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => onCancelDocumentUpload(lesson.id)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full text-sm transition-colors"
                                        disabled={isSaving || isUploadingDoc}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => onAddMaterial(lesson.id)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm transition-colors"
                                        disabled={isSaving || isUploadingDoc}
                                    >
                                        {isUploadingDoc ? 'Uploading...' : 'Upload Document'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubtopicItem;