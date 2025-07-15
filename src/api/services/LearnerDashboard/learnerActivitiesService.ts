import { getAllCertificates } from '../Course/certificateService';
import { Activity } from '../../../features/Learner/LearnerDashboard/types/types';
import { CombinedCertificateDto, CertificateDto } from '../../../types/course.types';
import { formatDistanceToNow } from 'date-fns';

const BADGE_CLAIM_STORAGE_KEY = 'recentBadgeClaims';
const CERTIFICATE_GEN_STORAGE_KEY = 'recentCertificateGens';

// This interface represents the unified structure for any activity we process.
interface ProcessedActivity {
  id: string;
  type: 'Certificate Earned' | 'Badge Earned';
  description: string;
  date: Date;
}

// This interface represents the data for a claimed badge.
interface StoredBadgeClaimDto {
    badgeId: string;
    badgeTitle: string;
    claimTime: string; // ISO date string
}

// This interface represents the data for a generated certificate.
interface StoredCertificateGenDto {
    courseId: number;
    courseTitle: string;
    generationTime: string; // ISO date string
}

/**
 * Fetches recent badge claims from session storage.
 */
const getRecentBadgeClaimsFromSession = async (): Promise<StoredBadgeClaimDto[]> => {
    try {
        const storedData = sessionStorage.getItem(BADGE_CLAIM_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error("Failed to parse badge claims from session storage:", error);
        sessionStorage.removeItem(BADGE_CLAIM_STORAGE_KEY);
        return [];
    }
};

/**
 * Fetches recent certificate generations from session storage.
 */
const getRecentCertificateGensFromSession = async (): Promise<StoredCertificateGenDto[]> => {
    try {
        const storedData = sessionStorage.getItem(CERTIFICATE_GEN_STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error("Failed to parse certificate generations from session storage:", error);
        sessionStorage.removeItem(CERTIFICATE_GEN_STORAGE_KEY);
        return [];
    }
};


/**
 * Fetches, combines, and sorts all recent learner activities.
 * This uses a hybrid approach: it prioritizes real-time events logged in the current session
 * and supplements them with historical data from the API.
 */
export const getRecentActivities = async (): Promise<Activity[]> => {
    try {
        // Fetch all data sources in parallel
        const [apiCertificates, sessionCertificateGens, sessionBadgeClaims] = await Promise.all([
            getAllCertificates(),
            getRecentCertificateGensFromSession(),
            getRecentBadgeClaimsFromSession(),
        ]);

        // 1. Process real-time certificate events from the current session
        const recentCertificateActivities: ProcessedActivity[] = sessionCertificateGens.map(gen => ({
            id: `cert-session-${gen.courseId}`,
            type: 'Certificate Earned',
            description: gen.courseTitle,
            date: new Date(gen.generationTime), // Use accurate client-side time
        }));
        
        // Create a set of course IDs from recent session events to avoid duplication
        const recentCourseIds = new Set(sessionCertificateGens.map(gen => gen.courseId));

        // 2. Process historical certificates from the API, excluding any that just happened in this session
        const historicalCertificateActivities: ProcessedActivity[] = apiCertificates
            .filter(cert => {
                // If it's an internal certificate, check if it was just generated.
                if (cert.type === 'internal') {
                    return !recentCourseIds.has((cert as CertificateDto).courseId);
                }
                // Keep all external certificates as they are not generated in-app.
                return true;
            })
            .map((cert: CombinedCertificateDto) => ({
                id: `cert-api-${cert.id}`,
                type: 'Certificate Earned',
                description: cert.type === 'internal' ? cert.courseTitle : cert.title,
                date: new Date(cert.completionDate),
            }));

        // 3. Process real-time badge claim events from the current session
        const badgeActivities: ProcessedActivity[] = sessionBadgeClaims.map((badge) => ({
            id: `badge-${badge.badgeId}`,
            type: 'Badge Earned',
            description: badge.badgeTitle,
            date: new Date(badge.claimTime),
        }));

        // 4. Combine all activities, sort by date (most recent first), and take the top 3.
        const allActivities = [
            ...recentCertificateActivities, 
            ...historicalCertificateActivities, 
            ...badgeActivities
        ];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const latestActivities = allActivities.slice(0, 3);

        // 5. Format the final list for the UI component.
        return latestActivities.map((activity, index) => ({
            id: index,
            type: activity.type,
            course: activity.description,
            time: formatDistanceToNow(activity.date, { addSuffix: true }),
        }));

    } catch (error) {
        console.error("Failed to fetch recent activities:", error);
        return [];
    }
};