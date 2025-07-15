import { getAllCertificates } from '../Course/certificateService';
import { Activity } from '../../../features/Learner/LearnerDashboard/types/types';
import { CombinedCertificateDto } from '../../../types/course.types';
import { formatDistanceToNow } from 'date-fns';

const BADGE_CLAIM_STORAGE_KEY = 'recentBadgeClaims';

interface ProcessedActivity {
  id: string;
  type: 'Certificate Earned' | 'Badge Earned';
  description: string;
  date: Date;
}

interface StoredBadgeClaimDto {
    badgeId: string;
    badgeTitle: string;
    claimTime: string; // ISO date string
}

/**
 * Fetches recent badge claims from session storage.
 * @returns A promise that resolves to an array of badge claims.
 */
const getRecentBadgeClaimsFromSession = async (): Promise<StoredBadgeClaimDto[]> => {
    try {
        const storedData = sessionStorage.getItem(BADGE_CLAIM_STORAGE_KEY);
        if (storedData) {
            const claims: StoredBadgeClaimDto[] = JSON.parse(storedData);
            return claims;
        }
    } catch (error) {
        console.error("Failed to parse badge claims from session storage:", error);
        sessionStorage.removeItem(BADGE_CLAIM_STORAGE_KEY);
    }
    return [];
};


/**
 * Fetches, combines, and sorts all recent learner activities.
 * @returns A promise that resolves to an array of the 3 most recent activities, formatted for display.
 */
export const getRecentActivities = async (): Promise<Activity[]> => {
    try {
        const [certificates, badgeClaims] = await Promise.all([
            getAllCertificates(),
            getRecentBadgeClaimsFromSession(),
        ]);

        const certificateActivities: ProcessedActivity[] = certificates.map((cert: CombinedCertificateDto) => ({
            id: `cert-${cert.id}`,
            type: 'Certificate Earned',
            description: cert.type === 'internal' ? cert.courseTitle : cert.title,
            date: new Date(cert.completionDate),
        }));

        const badgeActivities: ProcessedActivity[] = badgeClaims.map((badge) => ({
            id: `badge-${badge.badgeId}`,
            type: 'Badge Earned',
            description: badge.badgeTitle,
            date: new Date(badge.claimTime),
        }));

        const allActivities = [...certificateActivities, ...badgeActivities];
        allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
        const latestActivities = allActivities.slice(0, 3);

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