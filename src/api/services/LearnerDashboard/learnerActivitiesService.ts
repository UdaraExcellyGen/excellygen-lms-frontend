import { getAllCertificates } from '../Course/certificateService';
import { Activity } from '../../../features/Learner/LearnerDashboard/types/types';
import { CombinedCertificateDto } from '../../../types/course.types';
import { formatDistanceToNow } from 'date-fns';

// This interface represents the unified structure for any activity we process.
interface ProcessedActivity {
  id: string;
  type: 'Quiz Completed' | 'Certificate Earned' | 'Badge Earned';
  description: string;
  date: Date;
}

// This interface represents the expected data for a completed quiz.
// It's a placeholder until a real DTO is available from a backend endpoint.
interface MockQuizCompletionDto {
    attemptId: number;
    quizTitle: string;
    courseTitle: string;
    completionTime: string; // ISO date string
}

/**
 * MOCK FUNCTION: Fetches recent quiz completions.
 * @returns A promise that resolves to an array of mock quiz completions.
 * @description This is a placeholder. In a real application, this would be an API call
 * to an endpoint like `GET /api/learner/quiz-completions`.
 */
const getRecentQuizCompletionsForLearner_mock = async (): Promise<MockQuizCompletionDto[]> => {
    console.warn("Using MOCK DATA for quiz completions. This should be replaced with a real API call.");
    // This mock data simulates what the backend would return.
    return [
        {
            attemptId: 101,
            quizTitle: 'Module 1 Quiz',
            courseTitle: 'Web Development Fundamentals',
            completionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
    ];
};


/**
 * Fetches, combines, and sorts all recent learner activities.
 * @returns A promise that resolves to an array of the 3 most recent activities, formatted for display.
 */
export const getRecentActivities = async (): Promise<Activity[]> => {
    try {
        // Fetch all data sources in parallel.
        const [certificates, quizCompletions] = await Promise.all([
            getAllCertificates(),
            getRecentQuizCompletionsForLearner_mock(),
            // Future: Add getRecentBadgesForLearner() here.
        ]);

        // 1. Process earned certificates into the unified format.
        const certificateActivities: ProcessedActivity[] = certificates.map((cert: CombinedCertificateDto) => ({
            id: `cert-${cert.id}`,
            type: 'Certificate Earned',
            description: cert.type === 'internal' ? cert.courseTitle : cert.title,
            date: new Date(cert.completionDate),
        }));

        // 2. Process quiz completions into the unified format.
        const quizActivities: ProcessedActivity[] = quizCompletions.map((quiz) => ({
            id: `quiz-${quiz.attemptId}`,
            type: 'Quiz Completed',
            description: `${quiz.quizTitle} in ${quiz.courseTitle}`,
            date: new Date(quiz.completionTime),
        }));

        // 3. (Future) Process earned badges here.
        const badgeActivities: ProcessedActivity[] = [];

        // 4. Combine all activities, sort by date (most recent first), and take the top 3.
        const allActivities = [...certificateActivities, ...quizActivities, ...badgeActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const latestActivities = allActivities.slice(0, 3);

        // 5. Format the final list for the UI component.
        return latestActivities.map((activity, index) => ({
            id: index, // The UI component uses index as a key.
            type: activity.type,
            course: activity.description, // 'course' prop is used for the main description text.
            time: formatDistanceToNow(activity.date, { addSuffix: true }),
        }));

    } catch (error) {
        console.error("Failed to fetch recent activities:", error);
        return []; // Return an empty array on failure to prevent crashes.
    }
};