// src/hooks/useQuizCompletion.ts
// React hook for managing quiz completion state

import { useState, useEffect, useCallback } from 'react';
import {
  getQuizCompletionStatus,
  setQuizCompletionStatus,
  getCourseQuizCompletions,
  QuizCompletionStatus
} from '../features/Learner/BadgesAndRewards/utils/quizCompletionUtils';

interface UseQuizCompletionReturn {
  isCompleted: boolean;
  attemptId?: number;
  completedAt?: string;
  score?: number;
  markCompleted: (attemptId?: number, score?: number) => void;
  refresh: () => void;
}

/**
 * Hook for managing individual quiz completion state
 */
export const useQuizCompletion = (courseId: number, quizId: number): UseQuizCompletionReturn => {
  const [status, setStatus] = useState<QuizCompletionStatus>(() => 
    getQuizCompletionStatus(courseId, quizId)
  );

  const refresh = useCallback(() => {
    const newStatus = getQuizCompletionStatus(courseId, quizId);
    setStatus(newStatus);
  }, [courseId, quizId]);

  const markCompleted = useCallback((attemptId?: number, score?: number) => {
    setQuizCompletionStatus(courseId, quizId, true, attemptId, score);
    refresh();
  }, [courseId, quizId, refresh]);

  // Listen for quiz completion updates
  useEffect(() => {
    const handleQuizUpdate = (event: CustomEvent) => {
      const { courseId: eventCourseId, quizId: eventQuizId } = event.detail;
      if (eventCourseId === courseId && eventQuizId === quizId) {
        refresh();
      }
    };

    window.addEventListener('quiz-completion-updated', handleQuizUpdate as EventListener);
    return () => {
      window.removeEventListener('quiz-completion-updated', handleQuizUpdate as EventListener);
    };
  }, [courseId, quizId, refresh]);

  return {
    isCompleted: status.isCompleted,
    attemptId: status.attemptId,
    completedAt: status.completedAt,
    score: status.score,
    markCompleted,
    refresh
  };
};

interface UseCourseQuizCompletionsReturn {
  completions: Record<number, QuizCompletionStatus>;
  getTotalCompleted: () => number;
  getAverageScore: () => number;
  isQuizCompleted: (quizId: number) => boolean;
  getQuizAttemptId: (quizId: number) => number | undefined;
  refresh: () => void;
}

/**
 * Hook for managing all quiz completions in a course
 */
export const useCourseQuizCompletions = (courseId: number): UseCourseQuizCompletionsReturn => {
  const [completions, setCompletions] = useState<Record<number, QuizCompletionStatus>>(() => 
    getCourseQuizCompletions(courseId)
  );

  const refresh = useCallback(() => {
    const newCompletions = getCourseQuizCompletions(courseId);
    setCompletions(newCompletions);
  }, [courseId]);

  const getTotalCompleted = useCallback(() => {
    return Object.values(completions).filter(c => c.isCompleted).length;
  }, [completions]);

  const getAverageScore = useCallback(() => {
    const scoresWithData = Object.values(completions)
      .filter(c => c.isCompleted && c.score !== undefined);
    
    if (scoresWithData.length === 0) return 0;
    
    const total = scoresWithData.reduce((sum, c) => sum + (c.score || 0), 0);
    return Math.round(total / scoresWithData.length);
  }, [completions]);

  const isQuizCompleted = useCallback((quizId: number) => {
    return completions[quizId]?.isCompleted || false;
  }, [completions]);

  const getQuizAttemptId = useCallback((quizId: number) => {
    return completions[quizId]?.attemptId;
  }, [completions]);

  // Listen for quiz completion updates for this course
  useEffect(() => {
    const handleQuizUpdate = (event: CustomEvent) => {
      const { courseId: eventCourseId } = event.detail;
      if (eventCourseId === courseId) {
        refresh();
      }
    };

    const handleCourseCleanup = (event: CustomEvent) => {
      const { courseId: eventCourseId } = event.detail;
      if (eventCourseId === courseId) {
        setCompletions({});
      }
    };

    window.addEventListener('quiz-completion-updated', handleQuizUpdate as EventListener);
    window.addEventListener('course-quiz-completions-cleared', handleCourseCleanup as EventListener);
    
    return () => {
      window.removeEventListener('quiz-completion-updated', handleQuizUpdate as EventListener);
      window.removeEventListener('course-quiz-completions-cleared', handleCourseCleanup as EventListener);
    };
  }, [courseId, refresh]);

  return {
    completions,
    getTotalCompleted,
    getAverageScore,
    isQuizCompleted,
    getQuizAttemptId,
    refresh
  };
};