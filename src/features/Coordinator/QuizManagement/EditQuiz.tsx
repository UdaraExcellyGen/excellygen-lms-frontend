import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  QuizCreationState,
  QuizDetailDto,
  QuizBankDto,
  QuizBankQuestionDto,
  CreateQuizDto,
  CreateQuizBankDto,
  CreateQuizBankQuestionDto,
  UpdateQuizBankQuestionDto,
  MCQQuestionOptionDto
} from '../../../types/quiz.types';

import {
  getQuizDetails,
  getQuizBank,
  updateQuiz,
  addQuestionToBank,
  updateQuestion,
  deleteQuestion
} from '../../../api/services/Course/quizService';

interface OriginalQuestion {
  id: number;
  content: string;
  order: number;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
}

const EditQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { quizId: quizIdParam } = useParams<{ quizId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lessonIdParam = queryParams.get('lessonId');
  const courseIdParam = queryParams.get('courseId');

  const sourcePage = queryParams.get('source');
  
  // Parse and validate all IDs
  let quizId = 0;
  let lessonId = 0;
  let courseId = 0;
  
  try {
    quizId = quizIdParam ? parseInt(quizIdParam, 10) : 0;
    lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;
    courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;
    
    if (isNaN(quizId)) quizId = 0;
    if (isNaN(lessonId)) lessonId = 0;
    if (isNaN(courseId)) courseId = 0;
  } catch (e) {
    console.error("Error parsing URL parameters:", e);
  }

  // Store original courseId to ensure consistent navigation
  const [originalCourseId] = useState<number>(courseId);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [step, setStep] = useState<'details' | 'questions'>('details');
  const [quizBankId, setQuizBankId] = useState<number>(0);
  
  const [quizState, setQuizState] = useState<QuizCreationState>({
    quizTitle: '',
    timeLimitMinutes: 15,
    quizSize: 10,
    quizBankSize: 20,
    questions: [],
    currentQuestionIndex: 0,
    lessonId: lessonId
  });

  // Store original questions with their IDs for comparison during update
  const [originalQuestions, setOriginalQuestions] = useState<OriginalQuestion[]>([]);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBackNavigation = () => {
    const targetCourseId = originalCourseId || courseId;
    if (!targetCourseId) {
      // Safe fallback if courseId is somehow lost
      navigate(-1); 
      return;
    }

    if (sourcePage === 'course-view') {
      // Navigate back to the course view page
      navigate(`/coordinator/course-view/${targetCourseId}`);
    } else if (sourcePage === 'publish-course') {
      // NEW: Navigate back to the publish course page
      navigate(`/coordinator/publish-course/${targetCourseId}`);
    } else {
      // (Default): Navigate back to the upload materials page
      navigate(`/coordinator/upload-materials/${targetCourseId}`);
    }
  };


  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizId || !lessonId || !courseId) {
        toast.error('Missing required parameters');
        handleBackNavigation();
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch quiz details
        const quizDetails = await getQuizDetails(quizId);
        
        // Make sure quizBankId exists before fetching
        if (!quizDetails.quizBankId) {
          throw new Error("Quiz bank ID is missing from quiz details");
        }
        
        setQuizBankId(quizDetails.quizBankId);
        
        // Fetch quiz bank with questions
        const quizBank = await getQuizBank(quizDetails.quizBankId);

        // Store original questions for comparison during save
        const origQuestions: OriginalQuestion[] = quizBank.questions.map(q => ({
          id: q.quizBankQuestionId,
          content: q.questionContent,
          order: q.questionBankOrder || 0,
          options: q.options.map(o => ({
            id: o.mcqOptionId,
            text: o.optionText,
            isCorrect: o.isCorrect
          }))
        }));
        
        setOriginalQuestions(origQuestions);
        
        // Update state with fetched data
        setQuizState({
          quizTitle: quizDetails.quizTitle,
          timeLimitMinutes: quizDetails.timeLimitMinutes,
          quizSize: quizDetails.totalMarks,
          quizBankSize: quizBank.quizBankSize,
          questions: quizBank.questions.map(q => ({
            questionBankQuestionId: q.quizBankQuestionId,
            questionContent: q.questionContent,
            questionBankOrder: q.questionBankOrder || 0,
            options: q.options.map(o => ({
              mcqOptionId: o.mcqOptionId,
              optionText: o.optionText,
              isCorrect: o.isCorrect
            }))
          })),
          currentQuestionIndex: 0,
          lessonId: lessonId
        });
      } catch (error) {
        console.error('Error loading quiz data:', error);
        toast.error('Failed to load quiz data. Please try again.');
        handleBackNavigation();
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [quizId, lessonId, courseId, navigate]);

  const validateQuizDetails = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!quizState.quizTitle.trim()) {
      newErrors.quizTitle = 'Quiz title is required';
    }

    if (quizState.timeLimitMinutes < 1 || quizState.timeLimitMinutes > 180) {
      newErrors.timeLimitMinutes = 'Time limit must be between 1 and 180 minutes';
    }

    if (quizState.quizSize < 1 || quizState.quizSize > 100) {
      newErrors.quizSize = 'Quiz size must be between 1 and 100 questions';
    }

    if (quizState.quizBankSize < quizState.quizSize) {
      newErrors.quizBankSize = 'Question bank size must be at least equal to quiz size';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuizState(prev => ({
      ...prev,
      [name]: name === 'quizTitle' ? value : parseInt(value, 10) || 0
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: CreateQuizBankQuestionDto = {
      questionContent: '',
      options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ],
      questionBankOrder: quizState.questions.length + 1
    };

    setQuizState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      currentQuestionIndex: prev.questions.length
    }));
  };

  const handleQuestionContentChange = (content: string) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[prev.currentQuestionIndex] = {
        ...updatedQuestions[prev.currentQuestionIndex],
        questionContent: content
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (optionIndex: number, content: string) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[prev.currentQuestionIndex].options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        optionText: content
      };
      updatedQuestions[prev.currentQuestionIndex] = {
        ...updatedQuestions[prev.currentQuestionIndex],
        options: updatedOptions
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleCorrectAnswerChange = (optionIndex: number) => {
    setQuizState(prev => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[prev.currentQuestionIndex].options.map((option, index) => ({
        ...option,
        isCorrect: index === optionIndex
      }));
      updatedQuestions[prev.currentQuestionIndex] = {
        ...updatedQuestions[prev.currentQuestionIndex],
        options: updatedOptions
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveQuestion = () => {
    if (quizState.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }

    setQuizState(prev => {
      const updatedQuestions = prev.questions.filter((_, i) => i !== prev.currentQuestionIndex);
      return {
        ...prev,
        questions: updatedQuestions,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex, updatedQuestions.length - 1)
      };
    });
  };

  const handleNavigateToQuestion = (index: number) => {
    setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
  };

  const handleContinueToQuestions = () => {
    if (validateQuizDetails()) {
      setStep('questions');
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
  };

  // Always use the safe navigation function
  const handleCancel = () => {
    handleBackNavigation();
  };

  const handleSaveQuiz = async () => {
    if (!validateQuizDetails()) {
      toast.error('Please fix the errors in quiz details');
      setStep('details');
      return;
    }

    // Validate questions
    const invalidQuestionIndex = quizState.questions.findIndex(q => 
      !q.questionContent.trim() || 
      !q.options.some(o => o.isCorrect) ||
      q.options.some(o => !o.optionText.trim())
    );

    if (invalidQuestionIndex !== -1) {
      toast.error(`Question ${invalidQuestionIndex + 1} is incomplete. Please fill all fields and select a correct answer.`);
      setQuizState(prev => ({ ...prev, currentQuestionIndex: invalidQuestionIndex }));
      return;
    }

    if (quizState.questions.length < quizState.quizSize) {
      toast.error(`You need to create at least ${quizState.quizSize} questions for this quiz.`);
      return;
    }

    setIsSaving(true);
    const saveToastId = toast.loading('Updating quiz...');

    try {
      // 1. Update quiz basic details
      const quizDto: CreateQuizDto = {
        quizTitle: quizState.quizTitle,
        timeLimitMinutes: quizState.timeLimitMinutes,
        quizSize: quizState.quizSize,
        lessonId: lessonId
      };

      await updateQuiz(quizId, quizDto);

      // 2. Handle questions updates
      const updatePromises = [];
      const addPromises = [];
      const deletePromises = [];
      
      // Get current question IDs (will be undefined for new questions)
      const currentQuestionIds = quizState.questions
        .filter(q => q.questionBankQuestionId)
        .map(q => q.questionBankQuestionId);
      
      // Find deleted questions (in original but not in current)
      const deletedQuestionIds = originalQuestions
        .filter(oq => !currentQuestionIds.includes(oq.id))
        .map(oq => oq.id);
      
      // Delete removed questions
      for (const questionId of deletedQuestionIds) {
        deletePromises.push(deleteQuestion(questionId));
      }
      
      // For each current question
      for (const question of quizState.questions) {
        if (question.questionBankQuestionId) {
          // It's an existing question - update it
          const updateQuestionDto: UpdateQuizBankQuestionDto = {
            questionContent: question.questionContent.trim(),
            options: question.options.map(o => ({
              mcqOptionId: o.mcqOptionId, // Include the option ID for existing options
              optionText: o.optionText.trim(),
              isCorrect: o.isCorrect
            })),
            questionBankOrder: question.questionBankOrder
          };
          
          updatePromises.push(updateQuestion(question.questionBankQuestionId, updateQuestionDto));
        } else {
          // It's a new question - add it
          const newQuestionDto: CreateQuizBankQuestionDto = {
            questionContent: question.questionContent.trim(),
            options: question.options.map(o => ({
              optionText: o.optionText.trim(),
              isCorrect: o.isCorrect
            })),
            questionBankOrder: question.questionBankOrder
          };
          
          addPromises.push(addQuestionToBank(quizBankId, newQuestionDto));
        }
      }
      
      // Execute all operations in parallel
      await Promise.all([
        ...deletePromises, 
        ...updatePromises, 
        ...addPromises
      ]);

      toast.dismiss(saveToastId);
      toast.success('Quiz updated successfully!');
      
      // Ensure we navigate after the toast is shown and use our safe navigation function
      setTimeout(() => {
        handleBackNavigation();
      }, 100);
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.dismiss(saveToastId);
      toast.error('Failed to update quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center">
        <div className="text-white text-xl flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading quiz data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl p-6 mb-6 flex justify-between items-center shadow-lg border border-[#BF4BF6]/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel} 
              className="bg-[#34137C]/60 hover:bg-[#34137C] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center text-[#D68BF9]"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>Edit Quiz</span>
              <span className="text-sm bg-[#34137C] text-[#D68BF9] px-3 py-1 rounded-full">
                {quizState.quizTitle}
              </span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleCancel} 
              className="px-4 py-2 bg-[#34137C]/60 text-white rounded-lg hover:bg-[#34137C] transition-colors flex items-center gap-1"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveQuiz} 
              className="px-5 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-4">
          <button 
            className={`px-5 py-3 rounded-t-lg flex items-center gap-1.5 font-medium transition-colors ${
              step === 'details' 
              ? 'bg-[#1B0A3F]/60 text-white border-t border-l border-r border-[#BF4BF6]/30' 
              : 'bg-[#34137C]/30 text-[#D68BF9] hover:bg-[#34137C]/50'
            }`}
            onClick={() => setStep('details')}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step === 'details' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'
            }`}>1</span>
            Quiz Details
          </button>
          <button 
            className={`px-5 py-3 rounded-t-lg flex items-center gap-1.5 font-medium transition-colors ${
              step === 'questions' 
              ? 'bg-[#1B0A3F]/60 text-white border-t border-l border-r border-[#BF4BF6]/30' 
              : 'bg-[#34137C]/30 text-[#D68BF9] hover:bg-[#34137C]/50'
            }`}
            onClick={() => step === 'questions' ? null : handleContinueToQuestions()}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              step === 'questions' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'
            }`}>2</span>
            Questions ({quizState.questions.length})
          </button>
        </div>

        {/* Warning for modified quiz bank size */}
        {quizState.quizBankSize !== quizState.questions.length && (
          <div className="bg-[#1B0A3F]/60 backdrop-blur-md border-l-4 border-yellow-500 p-4 mb-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-yellow-200 text-sm">
                <span className="font-bold">Warning:</span> You've set the question bank size to {quizState.quizBankSize}, but you have {quizState.questions.length} questions. 
                {quizState.quizBankSize > quizState.questions.length 
                  ? ` You need to add ${quizState.quizBankSize - quizState.questions.length} more questions to match your bank size.` 
                  : ` You have ${quizState.questions.length - quizState.quizBankSize} more questions than your bank size.`}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#1B0A3F]/60 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg">
          {step === 'details' ? (
            // Quiz Details Form
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-medium">Quiz Title</label>
                <input
                  type="text"
                  name="quizTitle"
                  value={quizState.quizTitle}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizTitle ? 'border-red-500' : 'border-[#BF4BF6]/30'} focus:outline-none focus:border-[#BF4BF6]`}
                  placeholder="Enter quiz title"
                />
                {errors.quizTitle && <p className="text-red-400 mt-1 text-sm">{errors.quizTitle}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2 font-medium">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={quizState.timeLimitMinutes}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#BF4BF6]/30'} focus:outline-none focus:border-[#BF4BF6]`}
                    min="1"
                    max="180"
                  />
                  {errors.timeLimitMinutes && <p className="text-red-400 mt-1 text-sm">{errors.timeLimitMinutes}</p>}
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Quiz Size (questions shown)</label>
                  <input
                    type="number"
                    name="quizSize"
                    value={quizState.quizSize}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizSize ? 'border-red-500' : 'border-[#BF4BF6]/30'} focus:outline-none focus:border-[#BF4BF6]`}
                    min="1"
                    max="100"
                  />
                  {errors.quizSize && <p className="text-red-400 mt-1 text-sm">{errors.quizSize}</p>}
                </div>

                <div>
                  <label className="block text-white mb-2 font-medium">Question Bank Size</label>
                  <input
                    type="number"
                    name="quizBankSize"
                    value={quizState.quizBankSize}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizBankSize ? 'border-red-500' : 'border-[#BF4BF6]/30'} focus:outline-none focus:border-[#BF4BF6]`}
                    min={quizState.quizSize}
                  />
                  {errors.quizBankSize && <p className="text-red-400 mt-1 text-sm">{errors.quizBankSize}</p>}
                </div>
              </div>

              <div className="bg-[#34137C]/50 rounded-lg p-4 border border-[#BF4BF6]/30 text-white">
                <h3 className="text-[#D68BF9] font-semibold mb-2">About Quiz Banks</h3>
                <p className="text-sm">
                  The quiz bank lets you create a larger set of questions, from which a random subset will be chosen
                  each time a learner takes the quiz. This helps prevent memorization and encourages deeper understanding
                  of the material.
                </p>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleContinueToQuestions}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue to Questions
                  <ArrowLeft className="transform rotate-180 w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // Questions Form
            <div>
              {/* Question Navigation */}
              <div className="mb-6 border-b border-[#BF4BF6]/20 pb-4">
                <h3 className="text-white font-medium mb-3">Question Navigator</h3>
                <div className="flex flex-wrap gap-2">
                  {quizState.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigateToQuestion(index)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        quizState.currentQuestionIndex === index
                          ? 'bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] text-white shadow-md transform scale-105'
                          : 'bg-[#34137C]/60 text-[#D68BF9] hover:bg-[#34137C] hover:text-white'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleAddQuestion}
                    className="w-10 h-10 rounded-lg bg-[#34137C]/60 text-[#D68BF9] flex items-center justify-center hover:bg-[#34137C] transition-colors"
                    title="Add new question"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Current Question */}
              {quizState.questions.length > 0 && (
                <div className="bg-[#34137C]/40 rounded-lg p-6 mb-6 border border-[#BF4BF6]/20">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#BF4BF6]/20">
                    <h3 className="text-white font-semibold flex items-center">
                      <span className="bg-[#BF4BF6] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                        {quizState.currentQuestionIndex + 1}
                      </span>
                      Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
                    </h3>
                    <button
                      onClick={handleRemoveQuestion}
                      className="text-red-400 hover:text-red-300 bg-[#34137C]/60 hover:bg-[#34137C] p-2 rounded-lg transition-colors"
                      disabled={quizState.questions.length <= 1}
                      title="Delete this question"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white mb-2 font-medium">Question Content</label>
                    <textarea
                      value={quizState.questions[quizState.currentQuestionIndex]?.questionContent || ''}
                      onChange={(e) => handleQuestionContentChange(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#1B0A3F]/60 text-white border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
                      rows={3}
                      placeholder="Enter your question here"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-white mb-2 font-medium">
                      Answer Options (select the correct one)
                    </label>
                    {quizState.questions[quizState.currentQuestionIndex]?.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-3 bg-[#1B0A3F]/40 p-3 rounded-lg border border-[#BF4BF6]/20 hover:border-[#BF4BF6]/40 transition-colors">
                        <button
                          type="button"
                          onClick={() => handleCorrectAnswerChange(optionIndex)}
                          className={`rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${
                            option.isCorrect
                              ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white shadow-md transform scale-105'
                              : 'border-[#BF4BF6]/50 bg-transparent hover:bg-[#34137C]'
                          }`}
                        >
                          {option.isCorrect && <CheckCircle size={14} />}
                        </button>
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                          className="flex-1 p-2.5 rounded-lg bg-[#1B0A3F]/60 text-white border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleBackToDetails}
                  className="px-5 py-2.5 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Quiz Details
                </button>
                <button
                  onClick={handleSaveQuiz}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuiz;