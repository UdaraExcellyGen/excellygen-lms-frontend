import { getAllCertificates } from '../Course/certificateService';
import { Activity } from '../../../features/Learner/LearnerDashboard/types/types';
import { CombinedCertificateDto } from '../../../types/course.types';
import { formatDistanceToNow } from 'date-fns';

// This interface represents the unified structure for any activity we process.
interface ProcessedActivity {
    id: string;
    type: 'Certificate Earned' | 'Badge Earned'; // 'Quiz Completed' has been removed.
    description: string;
    date: Date;
}

/**
 * Fetches, combines, and sorts all recent learner activities.
 * @returns A promise that resolves to an array of the 3 most recent activities, formatted for display.
 */
export const getRecentActivities = async (): Promise<Activity[]> => {
    try {
        // Fetch all data sources in parallel. Only fetching certificates for now.
        const [certificates] = await Promise.all([
            getAllCertificates(),
            // Future: Add getRecentBadgesForLearner() here.
        ]);

        // 1. Process earned certificates into the unified format.
        const certificateActivities: ProcessedActivity[] = certificates.map((cert: CombinedCertificateDto) => ({
            id: `cert-${cert.id}`,
            type: 'Certificate Earned',
            description: cert.type === 'internal' ? cert.courseTitle : cert.title,
            date: new Date(cert.completionDate),
        }));

        // 2. (Future) Process earned badges here.
        const badgeActivities: ProcessedActivity[] = [];

        // 3. Combine all activities, sort by date (most recent first), and take the top 3.
        const allActivities = [...certificateActivities, ...badgeActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const latestActivities = allActivities.slice(0, 3);

        // 4. Format the final list for the UI component.
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