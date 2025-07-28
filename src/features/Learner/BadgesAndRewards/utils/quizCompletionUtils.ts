// src/utils/quizCompletionUtils.ts
// Utility functions for managing quiz completion state

export const QUIZ_COMPLETION_KEY = 'completedQuizzes';

export interface QuizCompletionData {
  isCompleted: boolean;
  attemptId?: number;
  completedAt: string;
  score?: number;
}

export interface QuizCompletionStatus {
  isCompleted: boolean;
  attemptId?: number;
  completedAt?: string;
  score?: number;
}

/**
 * Get quiz completion status from localStorage
 */
export const getQuizCompletionStatus = (courseId: number, quizId: number): QuizCompletionStatus => {
  try {
    const stored = localStorage.getItem(QUIZ_COMPLETION_KEY);
    if (!stored) return { isCompleted: false };
    
    const completedQuizzes = JSON.parse(stored);
    const quizKey = `${courseId}_${quizId}`;
    const quizData = completedQuizzes[quizKey];
    
    if (!quizData) return { isCompleted: false };
    
    return {
      isCompleted: Boolean(quizData.isCompleted),
      attemptId: quizData.attemptId,
      completedAt: quizData.completedAt,
      score: quizData.score
    };
  } catch (error) {
    console.error('Failed to get quiz completion status:', error);
    return { isCompleted: false };
  }
};

/**
 * Set quiz completion status in localStorage
 */
export const setQuizCompletionStatus = (
  courseId: number, 
  quizId: number, 
  isCompleted: boolean, 
  attemptId?: number,
  score?: number
): void => {
  try {
    const stored = localStorage.getItem(QUIZ_COMPLETION_KEY);
    const completedQuizzes = stored ? JSON.parse(stored) : {};
    
    const quizKey = `${courseId}_${quizId}`;
    const quizData: QuizCompletionData = {
      isCompleted,
      completedAt: new Date().toISOString()
    };
    
    if (attemptId) quizData.attemptId = attemptId;
    if (score !== undefined) quizData.score = score;
    
    completedQuizzes[quizKey] = quizData;
    
    localStorage.setItem(QUIZ_COMPLETION_KEY, JSON.stringify(completedQuizzes));
    
    // Emit event for real-time updates across components
    window.dispatchEvent(new CustomEvent('quiz-completion-updated', {
      detail: { courseId, quizId, isCompleted, attemptId, score }
    }));
    
  } catch (error) {
    console.error('Failed to set quiz completion status:', error);
  }
};

/**
 * Get all completed quizzes for a specific course
 */
export const getCourseQuizCompletions = (courseId: number): Record<number, QuizCompletionStatus> => {
  try {
    const stored = localStorage.getItem(QUIZ_COMPLETION_KEY);
    if (!stored) return {};
    
    const completedQuizzes = JSON.parse(stored);
    const courseCompletions: Record<number, QuizCompletionStatus> = {};
    
    Object.keys(completedQuizzes).forEach(key => {
      if (key.startsWith(`${courseId}_`)) {
        const quizId = parseInt(key.split('_')[1]);
        const data = completedQuizzes[key];
        courseCompletions[quizId] = {
          isCompleted: Boolean(data.isCompleted),
          attemptId: data.attemptId,
          completedAt: data.completedAt,
          score: data.score
        };
      }
    });
    
    return courseCompletions;
  } catch (error) {
    console.error('Failed to get course quiz completions:', error);
    return {};
  }
};

/**
 * Clear quiz completion data for a specific course (useful when unenrolling)
 */
export const clearCourseQuizCompletions = (courseId: number): void => {
  try {
    const stored = localStorage.getItem(QUIZ_COMPLETION_KEY);
    if (!stored) return;
    
    const completedQuizzes = JSON.parse(stored);
    const updatedCompletions: Record<string, QuizCompletionData> = {};
    
    Object.keys(completedQuizzes).forEach(key => {
      if (!key.startsWith(`${courseId}_`)) {
        updatedCompletions[key] = completedQuizzes[key];
      }
    });
    
    localStorage.setItem(QUIZ_COMPLETION_KEY, JSON.stringify(updatedCompletions));
    
    // Emit event for cleanup
    window.dispatchEvent(new CustomEvent('course-quiz-completions-cleared', {
      detail: { courseId }
    }));
    
  } catch (error) {
    console.error('Failed to clear course quiz completions:', error);
  }
};

/**
 * Get quiz completion statistics for dashboard
 */
export const getQuizCompletionStats = (): {
  totalQuizzesCompleted: number;
  averageScore: number;
  recentCompletions: Array<{
    courseId: number;
    quizId: number;
    completedAt: string;
    score?: number;
  }>;
} => {
  try {
    const stored = localStorage.getItem(QUIZ_COMPLETION_KEY);
    if (!stored) return { totalQuizzesCompleted: 0, averageScore: 0, recentCompletions: [] };
    
    const completedQuizzes = JSON.parse(stored);
    const completions = Object.keys(completedQuizzes)
      .filter(key => completedQuizzes[key].isCompleted)
      .map(key => {
        const [courseId, quizId] = key.split('_').map(Number);
        const data = completedQuizzes[key];
        return {
          courseId,
          quizId,
          completedAt: data.completedAt,
          score: data.score
        };
      });
    
    const totalCompleted = completions.length;
    const scoresWithData = completions.filter(c => c.score !== undefined);
    const averageScore = scoresWithData.length > 0 
      ? scoresWithData.reduce((sum, c) => sum + (c.score || 0), 0) / scoresWithData.length 
      : 0;
    
    // Get recent completions (last 10)
    const recentCompletions = completions
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10);
    
    return {
      totalQuizzesCompleted: totalCompleted,
      averageScore: Math.round(averageScore),
      recentCompletions
    };
  } catch (error) {
    console.error('Failed to get quiz completion stats:', error);
    return { totalQuizzesCompleted: 0, averageScore: 0, recentCompletions: [] };
  }
};

/**
 * Check if all quizzes in a course are completed
 */
export const areAllCourseQuizzesCompleted = (courseId: number, quizIds: number[]): boolean => {
  if (quizIds.length === 0) return true;
  
  const courseCompletions = getCourseQuizCompletions(courseId);
  return quizIds.every(quizId => courseCompletions[quizId]?.isCompleted);
};

/**
 * Sync quiz completion status with server data (useful for ensuring consistency)
 */
export const syncQuizCompletionWithServer = (
  courseId: number,
  serverQuizData: Array<{ quizId: number; isCompleted: boolean; lastAttemptId?: number }>
): void => {
  try {
    serverQuizData.forEach(({ quizId, isCompleted, lastAttemptId }) => {
      const currentStatus = getQuizCompletionStatus(courseId, quizId);
      
      // Only update if server shows completion but local doesn't
      if (isCompleted && !currentStatus.isCompleted) {
        setQuizCompletionStatus(courseId, quizId, true, lastAttemptId);
      }
    });
  } catch (error) {
    console.error('Failed to sync quiz completion with server:', error);
  }
};