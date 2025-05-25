// src/features/Coordinator/QuizManagement/EditQuiz.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, AlertCircle } from 'lucide-react';
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
  
  const quizId = quizIdParam ? parseInt(quizIdParam, 10) : 0;
  const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;

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

  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizId || !lessonId || !courseId) {
        toast.error('Missing required parameters');
        navigate(-1);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Loading quiz data for quizId:", quizId);
        
        // Fetch quiz details
        const quizDetails = await getQuizDetails(quizId);
        console.log("Quiz details loaded:", quizDetails);
        
        // Make sure quizBankId exists before fetching
        if (!quizDetails.quizBankId) {
          throw new Error("Quiz bank ID is missing from quiz details");
        }
        
        setQuizBankId(quizDetails.quizBankId);
        
        // Fetch quiz bank with questions
        const quizBank = await getQuizBank(quizDetails.quizBankId);
        console.log("Quiz bank loaded:", quizBank);

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
        navigate(`/coordinator/upload-materials/${courseId}`);
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

  const handleCancel = () => {
    if (courseId) {
      navigate(`/coordinator/upload-materials/${courseId}`);
    } else {
      navigate(-1);
    }
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
      navigate(`/coordinator/upload-materials/${courseId}`);
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.dismiss(saveToastId);
      toast.error('Failed to update quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#52007C] p-6 flex justify-center items-center">
      <p className="text-white text-xl">Loading quiz data...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCancel} 
              className="hover:bg-[#F6E6FF] p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-[#1B0A3F]" />
            </button>
            <h1 className="text-xl font-['Unbounded'] text-[#1B0A3F]">
              Edit Quiz
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCancel} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveQuiz} 
              className="px-4 py-2 bg-[#BF4BF6] text-white rounded-lg hover:bg-[#D68BF9] transition-colors flex items-center gap-2"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-4">
          <button 
            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'details' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
            onClick={() => setStep('details')}
          >
            Quiz Details
          </button>
          <button 
            className={`px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'questions' ? 'bg-[#BF4BF6] text-white' : 'bg-[#34137C] text-[#D68BF9]'}`}
            onClick={() => step === 'questions' ? null : handleContinueToQuestions()}
          >
            Questions ({quizState.questions.length})
          </button>
        </div>

        {/* Warning for modified quiz bank size */}
        {quizState.quizBankSize !== quizState.questions.length && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="text-yellow-500 mr-2 flex-shrink-0" size={20} />
              <p className="text-yellow-800 text-sm">
                <span className="font-bold">Warning:</span> You've set the question bank size to {quizState.quizBankSize}, but you have {quizState.questions.length} questions. 
                {quizState.quizBankSize > quizState.questions.length 
                  ? ` You need to add ${quizState.quizBankSize - quizState.questions.length} more questions to match your bank size.` 
                  : ` You have ${quizState.questions.length - quizState.quizBankSize} more questions than your bank size.`}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#1B0A3F]/40 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
          {step === 'details' ? (
            // Quiz Details Form
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Quiz Title</label>
                <input
                  type="text"
                  name="quizTitle"
                  value={quizState.quizTitle}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizTitle ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
                  placeholder="Enter quiz title"
                />
                {errors.quizTitle && <p className="text-red-500 mt-1">{errors.quizTitle}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={quizState.timeLimitMinutes}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
                    min="1"
                    max="180"
                  />
                  {errors.timeLimitMinutes && <p className="text-red-500 mt-1">{errors.timeLimitMinutes}</p>}
                </div>

                <div>
                  <label className="block text-white mb-2">Quiz Size (questions shown)</label>
                  <input
                    type="number"
                    name="quizSize"
                    value={quizState.quizSize}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
                    min="1"
                    max="100"
                  />
                  {errors.quizSize && <p className="text-red-500 mt-1">{errors.quizSize}</p>}
                </div>

                <div>
                  <label className="block text-white mb-2">Question Bank Size</label>
                  <input
                    type="number"
                    name="quizBankSize"
                    value={quizState.quizBankSize}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-[#34137C]/60 text-white border ${errors.quizBankSize ? 'border-red-500' : 'border-[#BF4BF6]/30'}`}
                    min={quizState.quizSize}
                  />
                  {errors.quizBankSize && <p className="text-red-500 mt-1">{errors.quizBankSize}</p>}
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
                  className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-lg transition-colors"
                >
                  Continue to Questions
                </button>
              </div>
            </div>
          ) : (
            // Questions Form
            <div>
              {/* Question Navigation */}
              <div className="flex mb-4 flex-wrap gap-2">
                {quizState.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigateToQuestion(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      quizState.currentQuestionIndex === index
                        ? 'bg-[#BF4BF6] text-white'
                        : 'bg-[#34137C] text-[#D68BF9]'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={handleAddQuestion}
                  className="w-10 h-10 rounded-full bg-[#34137C] text-[#D68BF9] flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Current Question */}
              {quizState.questions.length > 0 && (
                <div className="bg-[#34137C]/60 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Question {quizState.currentQuestionIndex + 1}</h3>
                    <button
                      onClick={handleRemoveQuestion}
                      className="text-red-400 hover:text-red-500"
                      disabled={quizState.questions.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-white mb-2">Question Content</label>
                    <textarea
                      value={quizState.questions[quizState.currentQuestionIndex]?.questionContent || ''}
                      onChange={(e) => handleQuestionContentChange(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30"
                      rows={3}
                      placeholder="Enter your question here"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-white mb-2">Answer Options (select the correct one)</label>
                    {quizState.questions[quizState.currentQuestionIndex]?.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCorrectAnswerChange(optionIndex)}
                          className={`rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center border ${
                            option.isCorrect
                              ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white'
                              : 'border-[#BF4BF6]/50 bg-transparent'
                          }`}
                        >
                          {option.isCorrect && '✓'}
                        </button>
                        <input
                          type="text"
                          value={option.optionText}
                          onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                          className="flex-1 p-2 rounded-lg bg-[#1B0A3F]/40 text-white border border-[#BF4BF6]/30"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleBackToDetails}
                  className="px-5 py-2 border border-[#BF4BF6]/30 text-[#D68BF9] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors"
                >
                  Back to Details
                </button>
                <button
                  onClick={handleSaveQuiz}
                  className="px-5 py-2 bg-[#BF4BF6] hover:bg-[#D68BF9] text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={isSaving}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
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