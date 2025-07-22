// src/features/Coordinator/QuizManagement/CreateQuiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

import { QuizCreationState, CreateQuizDto, CreateQuizBankDto, CreateQuizBankQuestionDto } from '../../../../types/quiz.types';
import { createQuiz, createQuizBank, getQuizzesByLessonId } from '../../../../api/services/Course/quizService';

// Import the new components
import { QuizHeader } from './components/QuizHeader';
import { StepTabs } from './components/StepTabs';
import { InfoBanner } from './components/InfoBanner';
import { QuizDetailsForm } from './components/QuizDetailsForm';
import { QuestionEditor } from './components/QuestionEditor';

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId: lessonIdParam } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const courseIdParam = queryParams.get('courseId');
  const sourcePage = queryParams.get('source');

  const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : 0;
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [step, setStep] = useState<'details' | 'questions'>('details');
  
  const [quizState, setQuizState] = useState<QuizCreationState>({
    quizTitle: '',
    timeLimitMinutes: 15,
    quizSize: 10,
    quizBankSize: 10,
    questions: [],
    currentQuestionIndex: 0,
    lessonId: lessonId
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBackNavigation = useCallback(() => {
    if (!courseId) {
      navigate(-1);
      return;
    }
    const path = sourcePage === 'course-view' ? `/coordinator/course-view/${courseId}`
               : sourcePage === 'publish-course' ? `/coordinator/publish-course/${courseId}`
               : `/coordinator/upload-materials/${courseId}`;
    navigate(path);
  }, [navigate, courseId, sourcePage]);

  useEffect(() => {
    const checkExistingQuiz = async () => {
      if (!lessonId || !courseId) {
        toast.error('Required IDs are missing from the URL.');
        navigate(-1);
        return;
      }
      try {
        const existingQuizzes = await getQuizzesByLessonId(lessonId);
        if (existingQuizzes.length > 0) {
          toast.error('This lesson already has a quiz. Only one quiz per lesson is allowed.');
          handleBackNavigation();
        }
      } catch (error) {
        console.error('Error checking existing quizzes:', error);
        toast.error('Failed to check existing quizzes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    checkExistingQuiz();
  }, [lessonId, courseId, handleBackNavigation, navigate]);
  
  const validateQuizDetails = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!quizState.quizTitle.trim()) newErrors.quizTitle = 'Quiz title is required';
    if (quizState.timeLimitMinutes < 1 || quizState.timeLimitMinutes > 180) newErrors.timeLimitMinutes = 'Time limit must be between 1 and 180 minutes';
    if (quizState.quizSize < 1 || quizState.quizSize > 100) newErrors.quizSize = 'Quiz size must be between 1 and 100 questions';
    if (quizState.quizBankSize < quizState.quizSize) newErrors.quizBankSize = 'Question bank size must be at least equal to quiz size';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [quizState]);

  const validateQuestion = (question: CreateQuizBankQuestionDto): string | null => {
    if (!question.questionContent.trim()) return 'Question content cannot be empty';
    if (!question.options.some(o => o.isCorrect)) return 'You must select a correct answer';
    if (question.options.some(o => !o.optionText.trim())) return 'All options must have content';
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['timeLimitMinutes', 'quizSize', 'quizBankSize'].includes(name);

    if (name === 'quizBankSize') {
      const newSize = parseInt(value, 10) || 0;
      setQuizState(prev => ({
        ...prev,
        [name]: newSize,
        questions: newSize < prev.questions.length ? prev.questions.slice(0, newSize) : prev.questions,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex, Math.max(0, newSize - 1))
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        [name]: isNumeric ? parseInt(value, 10) || 0 : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddQuestion = () => {
    if (quizState.questions.length >= quizState.quizBankSize) {
      toast.error(`You can only create ${quizState.quizBankSize} questions for this quiz bank.`);
      return;
    }
    const newQuestion: CreateQuizBankQuestionDto = {
      questionContent: '',
      options: Array(4).fill(null).map(() => ({ optionText: '', isCorrect: false })),
      questionBankOrder: quizState.questions.length + 1
    };
    setQuizState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      currentQuestionIndex: prev.questions.length
    }));
  };

  const updateQuestion = (index: number, newQuestionData: Partial<CreateQuizBankQuestionDto>) => {
      setQuizState(prev => {
          const updatedQuestions = [...prev.questions];
          updatedQuestions[index] = { ...updatedQuestions[index], ...newQuestionData };
          return { ...prev, questions: updatedQuestions };
      });
  };

  const handleQuestionContentChange = (content: string) => {
    updateQuestion(quizState.currentQuestionIndex, { questionContent: content });
  };
  
  const handleOptionChange = (optionIndex: number, text: string) => {
    const question = quizState.questions[quizState.currentQuestionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], optionText: text };
    updateQuestion(quizState.currentQuestionIndex, { options: newOptions });
  };

  const handleCorrectAnswerChange = (optionIndex: number) => {
    const question = quizState.questions[quizState.currentQuestionIndex];
    const newOptions = question.options.map((opt, idx) => ({ ...opt, isCorrect: idx === optionIndex }));
    updateQuestion(quizState.currentQuestionIndex, { options: newOptions });
  };
  
  const handleRemoveQuestion = () => {
    if (quizState.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuizState(prev => {
      const reorderedQuestions = prev.questions
        .filter((_, i) => i !== prev.currentQuestionIndex)
        .map((q, index) => ({ ...q, questionBankOrder: index + 1 }));
      return {
        ...prev,
        questions: reorderedQuestions,
        currentQuestionIndex: Math.min(prev.currentQuestionIndex, reorderedQuestions.length - 1)
      };
    });
  };

  const handleContinueToQuestions = () => {
    if (validateQuizDetails()) {
      setStep('questions');
      if (quizState.questions.length === 0) {
        handleAddQuestion();
      }
    }
  };
  
  const handleSaveQuiz = async () => {
    if (!validateQuizDetails()) {
      setStep('details');
      toast.error('Please fix the errors in quiz details');
      return;
    }
    if (quizState.questions.length !== quizState.quizBankSize) {
      toast.error(`You need exactly ${quizState.quizBankSize} questions, but have ${quizState.questions.length}.`);
      return;
    }
    for (let i = 0; i < quizState.questions.length; i++) {
      const errorMessage = validateQuestion(quizState.questions[i]);
      if (errorMessage) {
        toast.error(`Question ${i + 1}: ${errorMessage}`);
        setQuizState(prev => ({ ...prev, currentQuestionIndex: i }));
        return;
      }
    }

    setIsSaving(true);
    const saveToastId = toast.loading('Creating quiz...');

    try {
      const quizDto: CreateQuizDto = {
        quizTitle: quizState.quizTitle,
        timeLimitMinutes: quizState.timeLimitMinutes,
        quizSize: quizState.quizSize,
        lessonId: lessonId
      };
      await createQuiz(quizDto);

      const quizBankDto: CreateQuizBankDto = {
        quizBankSize: quizState.quizBankSize,
        questions: quizState.questions.map((q, index) => ({
          ...q,
          questionBankOrder: index + 1
        })),
      };
      await createQuizBank(lessonId, quizBankDto);

      toast.success('Quiz created successfully!', { id: saveToastId });
      handleBackNavigation();

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create quiz.', { id: saveToastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#52007C] flex justify-center items-center"><p className="text-white text-xl">Loading...</p></div>;
  }

  const hasRequiredQuestions = quizState.questions.length === quizState.quizBankSize;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
      <div className="max-w-7xl mx-auto">
        <QuizHeader onBack={handleBackNavigation} onSave={handleSaveQuiz} isSaving={isSaving} canSave={hasRequiredQuestions} />
        
        <StepTabs 
          currentStep={step}
          onStepChange={(newStep) => {
            if (newStep === 'questions') handleContinueToQuestions();
            else setStep(newStep);
          }}
          questionCount={quizState.questions.length}
          quizBankSize={quizState.quizBankSize}
        />
        
        {step === 'questions' && !hasRequiredQuestions && (
          <InfoBanner>
            You must create exactly {quizState.quizBankSize} questions for this quiz bank. 
            {quizState.questions.length < quizState.quizBankSize 
              ? ` Add ${quizState.quizBankSize - quizState.questions.length} more question(s).` 
              : ` Remove ${quizState.questions.length - quizState.quizBankSize} question(s).`}
          </InfoBanner>
        )}

        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6">
          {step === 'details' ? (
            <QuizDetailsForm
              quizState={quizState}
              errors={errors}
              onInputChange={handleInputChange}
              onContinue={handleContinueToQuestions}
            />
          ) : (
            <QuestionEditor
              quizState={quizState}
              isSaving={isSaving}
              hasRequiredQuestions={hasRequiredQuestions}
              onNavigateToQuestion={(index) => setQuizState(prev => ({ ...prev, currentQuestionIndex: index }))}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onQuestionContentChange={handleQuestionContentChange}
              onOptionChange={handleOptionChange}
              onCorrectAnswerChange={handleCorrectAnswerChange}
              onBackToDetails={() => setStep('details')}
              onSaveQuiz={handleSaveQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;