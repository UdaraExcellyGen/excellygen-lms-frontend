import { useEffect, useRef } from 'react';
import { getBadgesAndRewards } from '../api/services/Learner/badgesAndRewardsService';
import { Badge } from '../features/Learner/BadgesAndRewards/types/Badge';

export const useBadgeChecker = (checkTrigger: any) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    // This check prevents the hook from running on the first render of a component.
    // It will only run when the `checkTrigger` value changes.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Do not run if the trigger is in its initial state (e.g., 0).
    if (checkTrigger === 0) {
      return;
    }

    const checkBadges = async () => {
      try {
        // Fetch the latest state of all badges from the server.
        const currentBadges: Badge[] = await getBadgesAndRewards();
        
        // Get the list of badge IDs for which we have already shown a notification.
        const notifiedBadgesStr = sessionStorage.getItem('notifiedBadges');
        const notifiedBadges: string[] = notifiedBadgesStr ? JSON.parse(notifiedBadgesStr) : [];
        
        // Find badges that are unlocked but whose IDs are NOT in our notified list.
        const newUnlockedBadges = currentBadges.filter(badge => 
          badge.isUnlocked && !notifiedBadges.includes(badge.id)
        );
        
        // If we found any new badges, update the notified list (without showing toast).
        if (newUnlockedBadges.length > 0) {
          newUnlockedBadges.forEach(badge => {
            // Add the new badge's ID to our list of notified badges.
            notifiedBadges.push(badge.id);
          });
          
          // Save the updated list back to session storage.
          sessionStorage.setItem('notifiedBadges', JSON.stringify(notifiedBadges));
        }
      } catch (error) {
        console.error("Badge check failed:", error);
      }
    };

    checkBadges();

  }, [checkTrigger]); // The hook re-runs whenever the `checkTrigger` value changes.
};