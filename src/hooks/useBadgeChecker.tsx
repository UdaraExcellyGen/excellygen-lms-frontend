import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Gift } from 'lucide-react';
import { getBadgesAndRewards } from '../api/services/Learner/badgesAndRewardsService';
import { Badge } from '../features/Learner/BadgesAndRewards/types/Badge';

export const useBadgeChecker = (checkTrigger: any) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (checkTrigger === 0) {
      return;
    }

    const checkBadges = async () => {
      try {
        const currentBadges: Badge[] = await getBadgesAndRewards();
        
        const notifiedBadgesStr = sessionStorage.getItem('notifiedBadges');
        const notifiedBadges: string[] = notifiedBadgesStr ? JSON.parse(notifiedBadgesStr) : [];
        
        const newUnlockedBadges = currentBadges.filter(badge => 
          badge.isUnlocked && !notifiedBadges.includes(badge.id)
        );
        
        if (newUnlockedBadges.length > 0) {
          newUnlockedBadges.forEach(badge => {
            const toastContent = (
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <p className="font-bold text-base">New Badge Unlocked! 🎉</p>
                  <p className="text-sm">
                    You've earned the "{badge.title}" badge. Claim it in the Badges & Rewards page!
                  </p>
                </div>
              </div>
            );

            toast.success(toastContent, {
              duration: 8000,
              id: `badge-unlock-${badge.id}`
            });

            notifiedBadges.push(badge.id);
          });
          sessionStorage.setItem('notifiedBadges', JSON.stringify(notifiedBadges));
        }
      } catch (error) {
        console.error("Badge check failed:", error);
      }
    };

    checkBadges();

  }, [checkTrigger]);
};