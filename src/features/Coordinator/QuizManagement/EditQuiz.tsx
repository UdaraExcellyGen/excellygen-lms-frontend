import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    QuizCreationState,
    CreateQuizDto,
    CreateQuizBankQuestionDto,
    UpdateQuizBankQuestionDto,
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
    const isViewModeParam = queryParams.get('view') === 'true';

    let quizId = 0,
        lessonId = 0,
        courseId = 0;

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

    const [originalCourseId] = useState<number>(courseId);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [step, setStep] = useState<'details' | 'questions'>('details');
    const [quizBankId, setQuizBankId] = useState<number>(0);
    const [isViewOnly] = useState<boolean>(isViewModeParam);

    const [quizState, setQuizState] = useState<QuizCreationState>({
        quizTitle: '',
        timeLimitMinutes: 15,
        quizSize: 10,
        quizBankSize: 10,
        questions: [],
        currentQuestionIndex: 0,
        lessonId: lessonId
    });

    const [originalQuestions, setOriginalQuestions] = useState<OriginalQuestion[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleBackNavigation = () => {
        const targetCourseId = originalCourseId || courseId;
        if (!targetCourseId) {
            navigate(-1);
            return;
        }
        if (sourcePage === 'course-view') {
            navigate(`/coordinator/course-view/${targetCourseId}`);
        } else if (sourcePage === 'publish-course') {
            navigate(`/coordinator/publish-course/${targetCourseId}`);
        } else {
            navigate(`/coordinator/upload-materials/${targetCourseId}`);
        }
    };

    useEffect(() => {
        const loadQuizData = async () => {
            if (!quizId) return;
            try {
                setIsLoading(true);
                const quizDetails = await getQuizDetails(quizId);
                if (!quizDetails.quizBankId) throw new Error("Quiz bank ID is missing");

                setQuizBankId(quizDetails.quizBankId);
                const quizBank = await getQuizBank(quizDetails.quizBankId);

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

                setQuizState(prev => ({
                    ...prev,
                    quizTitle: quizDetails.quizTitle,
                    timeLimitMinutes: quizDetails.timeLimitMinutes,
                    quizSize: quizDetails.quizSize,
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
                    }))
                }));
            } catch (error) {
                toast.error('Failed to load quiz data.');
                handleBackNavigation();
            } finally {
                setIsLoading(false);
            }
        };
        loadQuizData();
    }, [quizId]);

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
        if (isViewOnly) return;
        const { name, value } = e.target;
        const isNumeric = ['timeLimitMinutes', 'quizSize', 'quizBankSize'].includes(name);

        setQuizState(prev => ({
            ...prev,
            [name]: isNumeric ? parseInt(value, 10) || 0 : value
        }));

        if (errors[name]) {
            const {
                [name]: _, ...rest
            } = errors;
            setErrors(rest);
        }
    };

    const handleAddQuestion = () => {
        if (isViewOnly) return;
        setQuizState(prev => ({
            ...prev,
            questions: [...prev.questions, {
                questionContent: '',
                options: Array(4).fill({
                    optionText: '',
                    isCorrect: false
                }),
                questionBankOrder: prev.questions.length + 1
            }],
            currentQuestionIndex: prev.questions.length
        }));
    };

    const handleQuestionContentChange = (content: string) => {
        if (isViewOnly) return;
        setQuizState(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[prev.currentQuestionIndex].questionContent = content;
            return { ...prev,
                questions: newQuestions
            };
        });
    };

    const handleOptionChange = (optionIndex: number, content: string) => {
        if (isViewOnly) return;
        setQuizState(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[prev.currentQuestionIndex].options[optionIndex] = { ...newQuestions[prev.currentQuestionIndex].options[optionIndex],
                optionText: content
            };
            return { ...prev,
                questions: newQuestions
            };
        });
    };

    const handleCorrectAnswerChange = (optionIndex: number) => {
        if (isViewOnly) return;
        setQuizState(prev => {
            const newQuestions = [...prev.questions];
            newQuestions[prev.currentQuestionIndex].options = newQuestions[prev.currentQuestionIndex].options.map((opt, idx) => ({ ...opt,
                isCorrect: idx === optionIndex
            }));
            return { ...prev,
                questions: newQuestions
            };
        });
    };

    const handleRemoveQuestion = () => {
        if (isViewOnly) return;
        if (quizState.questions.length <= 1) {
            toast.error("A quiz must have at least one question.");
            return;
        }
        setQuizState(prev => {
            const newQuestions = prev.questions.filter((_, idx) => idx !== prev.currentQuestionIndex);
            return { ...prev,
                questions: newQuestions,
                currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
            };
        });
    };


    const handleNavigateToQuestion = (index: number) => setQuizState(prev => ({ ...prev,
        currentQuestionIndex: index
    }));
    const handleContinueToQuestions = () => {
        if (validateQuizDetails()) {
            setStep('questions');
        }
    };
    const handleBackToDetails = () => setStep('details');
    const handleCancel = () => handleBackNavigation();

    const handleSaveQuiz = async () => {
        if (isViewOnly) return;
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
            setQuizState(prev => ({ ...prev,
                currentQuestionIndex: invalidQuestionIndex
            }));
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

            // Get current question IDs
            const currentQuestionIds = quizState.questions
                .filter(q => q.questionBankQuestionId)
                .map(q => q.questionBankQuestionId);

            // Find deleted questions
            const deletedQuestionIds = originalQuestions
                .filter(oq => !currentQuestionIds.includes(oq.id))
                .map(oq => oq.id);

            for (const questionId of deletedQuestionIds) {
                deletePromises.push(deleteQuestion(questionId));
            }

            for (const question of quizState.questions) {
                if (question.questionBankQuestionId) {
                    const updateQuestionDto: UpdateQuizBankQuestionDto = {
                        questionContent: question.questionContent.trim(),
                        options: question.options.map(o => ({
                            mcqOptionId: o.mcqOptionId,
                            optionText: o.optionText.trim(),
                            isCorrect: o.isCorrect
                        })),
                        questionBankOrder: question.questionBankOrder
                    };
                    updatePromises.push(updateQuestion(question.questionBankQuestionId, updateQuestionDto));
                } else {
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
            await Promise.all([
                ...deletePromises,
                ...updatePromises,
                ...addPromises
            ]);

            toast.dismiss(saveToastId);
            toast.success('Quiz updated successfully!');

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
        return <div className = "min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex justify-center items-center text-white" > Loading... </div>;
    }

    if (isViewOnly) {
        return (  
        <div className = "min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6" >
    <div className = "max-w-7xl mx-auto" >
    <div className = "bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 flex justify-between items-center shadow-lg border border-[#BF4BF6]/20" >
    <div className = "flex items-center gap-4" >
    <button onClick = { handleCancel}
className = "p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center text-[#1B0A3F]" > < ArrowLeft size = { 20}/> </button> 
<h1 className = "text-xl font-semibold text-[#1B0A3F] flex items-center gap-5" > < span > View Quiz </span><span className="text-sm bg-[#34137C] text-white px-4 py-1 rounded-lg">{quizState.quizTitle}</span > </h1> 
</div> 
            <button onClick = { handleCancel}
            className = "px-4 py-2 bg-gray-400 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1" >
            Back 
            </button> 
            </div> 
            <div className = "flex items-center mb-1" >
            <button onClick = {() => setStep('details')
            }
            className = { `px-4 py-2 rounded-tl-lg rounded-tr-lg  ${step === 'details' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`
        } >
        Quiz Details 
        </button> 
        <button onClick = { handleContinueToQuestions}
        className = { `px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'questions' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`
    } >
    Questions({ quizState.questions.length } / { quizState.quizBankSize }) 
    </button> 
    </div> 
    <div className = "bg-white/90 rounded-b-lg rounded-r-lg p-6" > {
        step === 'details' ? ( 
        <div className = "space-y-6" >
            <div > < label className = "block text-[#1B0A3F] mb-1" > Quiz Title </label><input type="text" value={quizState.quizTitle} readOnly className="w-full p-2.5 rounded-lg border border-[#52007C]"/ > </div> 
            <div className = "grid grid-cols-3 gap-6" >
            <div > < label className = "block text-[#1B0A3F] mb-1" > Time Limit(minutes) </label><input type="number" value={quizState.timeLimitMinutes} readOnly className="w-full p-2.5 rounded-lg border border-[#52007C]"/ > </div> 
            <div > < label className = "block text-[#1B0A3F] mb-1" > Quiz Size(questions shown) </label><input type="number" value={quizState.quizSize} readOnly className="w-full p-2.5 rounded-lg border border-[#52007C]"/ > </div> 
            <div > < label className = "block text-[#1B0A3F] mb-1" > Question Bank Size </label><input type="number" value={quizState.quizBankSize} readOnly className="w-full p-2.5 rounded-lg border border-[#52007C]"/ > </div> 
            </div> 
            <div className = "bg-[#1B0A3F]/80 p-4 rounded-lg" >
            <h3 className = "font-semibold text-gray-200" > About Quiz Banks </h3> 
            <p className = "text-sm text-gray-400 mt-1" > The quiz bank lets you create a larger set of questions, from which a random subset will be chosen each time a learner takes the quiz. </p> 
            <p className = "text-sm text-yellow-400 mt-2" > Note: This quiz is in view - only mode.You cannot edit details or add / remove questions. </p> 
            </div> 
            <div className = "flex justify-end pt-4" > < button onClick = { handleContinueToQuestions}
            className = "px-5 py-2.5 border border-[#52007C] text-[#1B0A3F] rounded-lg hover:bg-[#BF4BF6]/10 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" > View Questions </button></div >
            </div>
        ) : ( 
        <div className = "space-y-6" >
            <div className = "flex items-center gap-2 flex-wrap" > {
                quizState.questions.map((_, index) => ( < button key = { index}
                    onClick = {
                        () => handleNavigateToQuestion(index)
                    }
                    className = { `w-9 h-9 rounded-md flex items-center justify-center font-bold transition-colors ${quizState.currentQuestionIndex === index ? 'bg-[#34137C] text-white' : 'bg-[#34137C]/50 text-white'}`
                } > { index + 1 } </button>))} 
                </div> {
                quizState.questions.length > 0 && ( 
                <div className = " p-5 rounded-lg space-y-4" >
                <h3 className = "font-semibold text-lg" > Question { quizState.currentQuestionIndex + 1 } </h3> 
                <div > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Question Content </label><textarea value={quizState.questions[quizState.currentQuestionIndex]?.questionContent || ''} readOnly rows={3} className="w-full p-2.5 rounded-lg border border-transparent"/ > </div> 
                <div >
                <label className = "block text-[#1B0A3F] mb-2 font-medium" > Answer Options </label> 
                <div className = "space-y-3" > {
                    quizState.questions[quizState.currentQuestionIndex]?.options.map((option, optionIndex) => ( 
                <div key = { optionIndex}
                className = "flex items-center gap-3" >
                <div className = { `w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${option.isCorrect ? 'bg-[#BF4BF6] border-[#BF4BF6]' : 'border-gray-500'}`
            } > { option.isCorrect && < CheckCircle size = { 14}/>}</div> 
            <input type = "text"
            value = { option.optionText}
            readOnly className = "w-full p-2.5 rounded-lg border border-transparent" />
                </div>
            ))
        } 
        </div> 
        </div> 
        </div>
    )
} 
<div className = "flex justify-between items-center pt-4" > < button onClick = { handleBackToDetails}
className = "px-5 py-2.5 border border-[#52007C] text-[#1B0A3F] rounded-lg hover:bg-[#BF4BF6]/10 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" > Back to Details </button></div >
    </div>
)
} 
</div> 
</div> 
</div>
);
} else {
return ( 
<div className = "min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6" >
    <div className = "max-w-7xl mx-auto" >
    <div className = "bg-white/90 backdrop-blur-md rounded-xl p-6 mb-6 flex justify-between items-center shadow-lg border border-[#BF4BF6]/20" >
    <div className = "flex items-center gap-4" >
    <button onClick = { handleCancel}
className = "p-2 rounded-lg transition-colors h-10 w-10 flex items-center justify-center text-[#1B0A3F]" > < ArrowLeft size = { 20}/> </button> 
<h1 className = "text-xl font-semibold text-[#1B0A3F] flex items-center gap-5" > < span > Edit Quiz </span><span className="text-sm bg-[#34137C] text-white px-4 py-1 rounded-lg">{quizState.quizTitle}</span > </h1> 
</div> 
<div className = "flex gap-3" >
<button onClick = { handleCancel}
className = "px-4 py-2 bg-gray-400 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
disabled = { isSaving } > Cancel </button> 
<button onClick = { handleSaveQuiz}
className = "px-5 py-2 bg-[#52007C] hover:bg-[#D68BF9] text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
disabled = { isSaving } > {
    isSaving ? 'Saving...' : < > < Save size = { 16}/> Save Changes</>
} 
</button> 
</div> 
</div> 
<div className = "flex mb-4" >
<button className = { `px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'details' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`
}
onClick = {
    () => setStep('details')
} >
Quiz Details 
</button> 
<button className = { `px-4 py-2 rounded-tl-lg rounded-tr-lg ${step === 'questions' ? 'bg-white/90 text-[#1B0A3F]' : 'bg-[#34137C] text-white/90'}`
}
onClick = { handleContinueToQuestions} >
Questions ({quizState.questions.length}) 
</button> 
</div> {
quizState.quizBankSize !== quizState.questions.length && ( 
<div className = "bg-[#1B0A3F]/60 backdrop-blur-md border-l-4 border-yellow-500 p-4 mb-4 rounded-lg" > < div className = "flex items-start" > < AlertCircle className = "text-yellow-500 mr-2 flex-shrink-0"
size = { 20}/> <p className="text-yellow-200 text-sm"><span className="font-bold">Warning:</span > You have { quizState.questions.length }
questions, but your bank size is { quizState.quizBankSize }. </p></div > </div>
)
} 
<div className = "bg-white/90 backdrop-blur-md rounded-xl border border-[#BF4BF6]/20 p-6 shadow-lg" > {
step === 'details' ? ( 
<div className = "space-y-6" >
<div > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Quiz Title </label><input type="text" name="quizTitle" value={quizState.quizTitle} onChange={handleInputChange} className={`w-full p-3 rounded-lg text-[#1B0A3F] border ${errors.quizTitle ? 'border-red-500' : 'border-[#52007C]'} focus:outline-none focus:border-[#BF4BF6]`} placeholder="Enter quiz title"/ > {
    errors.quizTitle && < p className = "text-red-400 mt-1 text-sm" > { errors.quizTitle } </p>}</div> 
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Time Limit(minutes) </label><input type="number" name="timeLimitMinutes" value={quizState.timeLimitMinutes} onChange={handleInputChange} className={`w-full p-3 rounded-lg text-[#1B0A3F] border ${errors.timeLimitMinutes ? 'border-red-500' : 'border-[#52007C]'} focus:outline-none focus:border-[#BF4BF6]`} min="1" max="180"/ > {
        errors.timeLimitMinutes && < p className = "text-red-400 mt-1 text-sm" > { errors.timeLimitMinutes } </p>}</div> 
        <div > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Quiz Size(questions shown) </label><input type="number" name="quizSize" value={quizState.quizSize} onChange={handleInputChange} className={`w-full p-3 rounded-lg text[#1B0A3F] border ${errors.quizSize ? 'border-red-500' : 'border-[#52007C]'} focus:outline-none focus:border-[#BF4BF6]`} min="1" max="100"/ > {
            errors.quizSize && < p className = "text-red-400 mt-1 text-sm" > { errors.quizSize } </p>}</div> 
            <div > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Question Bank Size </label><input type="number" name="quizBankSize" value={quizState.quizBankSize} onChange={handleInputChange} className={`w-full p-3 rounded-lg text-[#1B0A3F] border ${errors.quizBankSize ? 'border-red-500' : 'border-[#52007C]'} focus:outline-none focus:border-[#BF4BF6]`} min={quizState.quizSize}/ > {
                errors.quizBankSize && < p className = "text-red-400 mt-1 text-sm" > { errors.quizBankSize } </p>}</div> 
                </div> 
                <div className = "bg-[#34137C]/70 rounded-lg p-4 border border-[#BF4BF6]/30 text-white" > < h3 className = "text-[#D68BF9] font-semibold mb-2" > About Quiz Banks </h3><p className="text-sm">The quiz bank lets you create a larger set of questions, from which a random subset will be chosen each time a learner takes the quiz. This helps prevent memorization and encourages deeper understanding of the material.</p > </div> 
                <div className = "flex justify-end mt-4" > < button onClick = { handleContinueToQuestions}
                className = "px-5 py-2.5 border border-[#52007C] text-[#1B0A3F] rounded-lg hover:bg-[#BF4BF6]/10 rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" > Continue to Questions < ArrowLeft className = "transform rotate-180 w-4 h-4"/> </button></div >
                </div>
            ) : ( 
            <div >
                <div className = "mb-6 border-b border-[#BF4BF6]/20 pb-4" > < h3 className = "text-[#1B0A3F] font-medium mb-3" > Question Navigator </h3><div className="flex flex-wrap gap-2">{quizState.questions.map((_, index) => (<button key={index} onClick={() => handleNavigateToQuestion(index)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${quizState.currentQuestionIndex === index ? 'bg-[#34137C]/80 text-white shadow-md transform scale-105' : 'bg-[#34137C] text-white/90 hover:bg-[#34137C]/60 hover:text-white'}`}>{index + 1}</button >))
            } < button onClick = { handleAddQuestion}
            className = "w-10 h-10 rounded-lg bg-[#34137C] text-white/90 flex items-center justify-center hover:bg-[#34137C] transition-colors"
            title = "Add new question" > < Plus size = { 18}/> </button></div > </div> {
                quizState.questions.length > 0 && ( 
            <div className = " rounded-lg p-6 mb-6 border border-[#34137C]" >
                <div className = "flex justify-between items-center mb-4 pb-3 border-b border-[#BF4BF6]/20" > < h3 className = "text-[#1B0A3F] font-semibold flex items-center" > Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</h3 > < button onClick = { handleRemoveQuestion}
            className = "text-red-500 hover:text-red-400 p-2 rounded-lg transition-colors"
            disabled = { quizState.questions.length <= 1 }
            title = "Delete this question" > < Trash2 size = { 16}/> </button></div >
            <div className = "mb-6" > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Question Content </label><textarea value={quizState.questions[quizState.currentQuestionIndex]?.questionContent || ''} onChange={(e) => handleQuestionContentChange(e.target.value)} className="w-full p-3 rounded-lg text-[#1B0A3F] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]" rows={3} placeholder="Enter your question here"/ > </div> 
            <div className = "space-y-4" > < label className = "block text-[#1B0A3F] mb-2 font-medium" > Answer Options(select the correct one) </label>{quizState.questions[quizState.currentQuestionIndex]?.options.map((option, optionIndex) => (<div key={optionIndex} className="flex items-center gap-3 p-3 rounded-lg  transition-colors"><button type="button" onClick={() => handleCorrectAnswerChange(optionIndex)} className={`rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center border transition-all duration-200 ${option.isCorrect ? 'bg-[#BF4BF6] border-[#BF4BF6] text-white shadow-md transform scale-105' : 'border-[#BF4BF6]/50 bg-transparent hover:bg-[#34137C]'}`}>{option.isCorrect && <CheckCircle size={14}/>}</button > < input type = "text"
            value = { option.optionText}
            onChange = {
                (e) => handleOptionChange(optionIndex, e.target.value)
            }
            className = "flex-1 p-2.5 rounded-lg text-[#1B0A3F] border border-[#BF4BF6]/30 focus:outline-none focus:border-[#BF4BF6]"
            placeholder = { `Option ${optionIndex + 1}`}/> </div >))} </div >
                </div>
            )
        } 
        <div className = "flex justify-between mt-6" > < button onClick = { handleBackToDetails}
        className = "px-5 py-2.5 border border-[#52007C] text-[#1B0A3F] rounded-lg hover:bg-[#BF4BF6]/10 transition-colors flex items-center gap-2" > < ArrowLeft className = "w-4 h-4"/> Back to Quiz Details </button> <button onClick={handleSaveQuiz} className="px-5 py-2.5 bg-[#52007C] hover:bg-[#D68BF9] text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" disabled={isSaving}>{isSaving ? 'Saving...' : <><Save size={16}/> Save Quiz</>}</button > </div> 
        </div>
    )
} 
</div> 
</div> 
</div>
);
}
};

export default EditQuiz;