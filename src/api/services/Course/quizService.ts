// src/api/services/Course/quizService.ts
import apiClient from '../../apiClient';
import { AxiosRequestConfig } from 'axios'; // Import AxiosRequestConfig
import {
  QuizDto,
  QuizDetailDto,
  QuizBankDto,
  QuizBankQuestionDto,
  LearnerQuizQuestionDto,
  CreateQuizDto,
  CreateQuizBankDto,
  CreateQuizBankQuestionDto,
  UpdateQuizBankQuestionDto,
  QuizAttemptDto,
  QuizAttemptDetailDto,
  StartQuizAttemptDto,
  SubmitQuizAnswerDto,
  CompleteQuizAttemptDto
} from '../../../types/quiz.types';

// ----- Coordinator Quiz Management -----

// Get quizzes for a lesson
export const getQuizzesByLessonId = async (lessonId: number, config?: AxiosRequestConfig): Promise<QuizDto[]> => {
  const response = await apiClient.get<QuizDto[]>(`/quiz/lesson/${lessonId}`, config);
  return response.data;
};

// Get quiz details including questions
export const getQuizDetails = async (quizId: number): Promise<QuizDetailDto> => {
  const response = await apiClient.get<QuizDetailDto>(`/quiz/${quizId}`);
  return response.data;
};

// Create a new quiz
export const createQuiz = async (createQuizDto: CreateQuizDto): Promise<QuizDto> => {
  const response = await apiClient.post<QuizDto>('/quiz', createQuizDto);
  return response.data;
};

// Update a quiz
export const updateQuiz = async (quizId: number, updateQuizDto: CreateQuizDto): Promise<void> => {
  await apiClient.put(`/quiz/${quizId}`, updateQuizDto);
};

// Delete a quiz
export const deleteQuiz = async (quizId: number): Promise<void> => {
  await apiClient.delete(`/quiz/${quizId}`);
};

// ----- Quiz Bank Management -----

export const getQuizBank = async (quizBankId: number): Promise<QuizBankDto> => {
  const response = await apiClient.get<QuizBankDto>(`/quiz/bank/${quizBankId}`);
  return response.data;
};

export const createQuizBank = async (lessonId: number, createQuizBankDto: CreateQuizBankDto): Promise<QuizBankDto> => {
  const response = await apiClient.post<QuizBankDto>(`/quiz/bank/lesson/${lessonId}`, createQuizBankDto);
  return response.data;
};

// ----- Question Management -----

export const getQuestion = async (questionId: number): Promise<QuizBankQuestionDto> => {
  const response = await apiClient.get<QuizBankQuestionDto>(`/quiz/question/${questionId}`);
  return response.data;
};

export const getQuestionsForBank = async (quizBankId: number): Promise<QuizBankQuestionDto[]> => {
  const response = await apiClient.get<QuizBankQuestionDto[]>(`/quiz/bank/${quizBankId}/questions`);
  return response.data;
};

export const addQuestionToBank = async (quizBankId: number, createQuestionDto: CreateQuizBankQuestionDto): Promise<QuizBankQuestionDto> => {
  const response = await apiClient.post<QuizBankQuestionDto>(`/quiz/bank/${quizBankId}/question`, createQuestionDto);
  return response.data;
};

export const updateQuestion = async (questionId: number, updateQuestionDto: UpdateQuizBankQuestionDto): Promise<void> => {
  await apiClient.put(`/quiz/question/${questionId}`, updateQuestionDto);
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
  await apiClient.delete(`/quiz/question/${questionId}`);
};

// ----- Learner Quiz Interface -----

export const getQuestionsForLearner = async (quizId: number): Promise<LearnerQuizQuestionDto[]> => {
  const response = await apiClient.get<LearnerQuizQuestionDto[]>(`/quiz/learner/${quizId}`);
  return response.data;
};

export const startQuizAttempt = async (quizId: number): Promise<QuizAttemptDto> => {
  const response = await apiClient.post<QuizAttemptDto>('/quiz/attempt/start', { quizId } as StartQuizAttemptDto);
  return response.data;
};

export const submitQuizAnswer = async (attemptId: number, questionId: number, selectedOptionId: number): Promise<boolean> => {
  const payload: SubmitQuizAnswerDto = {
    quizAttemptId: attemptId,
    quizBankQuestionId: questionId,
    selectedOptionId: selectedOptionId
  };
  const response = await apiClient.post<boolean>('/quiz/attempt/answer', payload);
  return response.data;
};

export const completeQuizAttempt = async (attemptId: number): Promise<QuizAttemptDto> => {
  const response = await apiClient.post<QuizAttemptDto>('/quiz/attempt/complete', { quizAttemptId: attemptId } as CompleteQuizAttemptDto);
  return response.data;
};

// ----- Quiz Results -----

export const getQuizAttemptDetails = async (attemptId: number): Promise<QuizAttemptDetailDto> => {
  const response = await apiClient.get<QuizAttemptDetailDto>(`/quiz/attempt/${attemptId}`);
  return response.data;
};

export const getUserAttempts = async (): Promise<QuizAttemptDto[]> => {
  const response = await apiClient.get<QuizAttemptDto[]>('/quiz/attempts/user');
  return response.data;
};

export const getQuizAttempts = async (quizId: number): Promise<QuizAttemptDto[]> => {
  const response = await apiClient.get<QuizAttemptDto[]>(`/quiz/attempts/quiz/${quizId}`);
  return response.data;
};