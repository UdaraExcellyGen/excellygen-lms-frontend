import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

import Layout from '../../../components/Sidebar/Layout';
import PageHeader from './components/PageHeader';
import StatsOverview from './components/StatsOverview';
import BadgeGrid from './components/BadgeGrid';
import ConfirmClaimModal from './components/ConfirmClaimModal';
import { Badge } from './types/Badge';
import { getBadgesAndRewards, claimBadge } from '../../../api/services/Learner/badgesAndRewardsService'; 

const BadgesAndRewards: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousBadgesRef = useRef<Badge[]>([]);

  const fetchBadges = useCallback(async () => {
    // No setLoading(true) here to allow for background refresh
    try {
      const userBadges = await getBadgesAndRewards();
      setBadges(userBadges);
      setError(null);
    } catch (err) {
      setError("Failed to load your badges. Please try again later.");
      console.error("Error fetching badges:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // THIS IS THE NEW LOGIC FOR THE TOAST NOTIFICATION
  useEffect(() => {
    // Only run if we have a previous state to compare against
    if (previousBadgesRef.current.length > 0) {
      const newlyUnlockedBadges = badges.filter(currentBadge => {
        // Find the corresponding badge in the previous state
        const prevBadge = previousBadgesRef.current.find(b => b.id === currentBadge.id);
        // A badge is "newly unlocked" if it is now unlocked but was previously locked.
        return currentBadge.isUnlocked && (!prevBadge || !prevBadge.isUnlocked);
      });

      // Fire a toast for each newly unlocked badge
      newlyUnlockedBadges.forEach(badge => {
        toast.success(t => (
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="font-bold">New Badge Unlocked!</p>
              <p>You've earned the '{badge.title}' badge. Go to Badges & Rewards to claim it!</p>
            </div>
          </div>
        ), {
          duration: 6000, // Keep the toast on screen a bit longer
        });
      });
    }

    // Update the ref with the current state for the next render
    previousBadgesRef.current = badges;
  }, [badges]);

  const handleClaimBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowClaimModal(true);
  };

  const confirmClaim = async () => {
    if (!selectedBadge) return;
    setIsClaiming(true);
    try {
        const claimedBadge = await claimBadge(selectedBadge.id);
        setBadges(badges.map(b => (b.id === claimedBadge.id ? claimedBadge : b)));
        toast.success(`${selectedBadge.title} badge claimed successfully!`);
    } catch (err) {
        toast.error("Failed to claim badge. Please try again.");
        console.error(`Error claiming badge ${selectedBadge.id}:`, err);
    } finally {
        setIsClaiming(false);
        setShowClaimModal(false);
        setSelectedBadge(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-b from-indigo to-persian-indigo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <PageHeader 
            title="Learning Achievements"
            subtitle="Track your progress, claim your rewards, and celebrate your milestones on your learning journey."
          />

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-red-700 border-l-4 rounded-md bg-red-100 border-status-error font-nunito" role="alert">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div><p className="font-bold">Error:</p><p>{error}</p></div>
            </div>
          )}

          <StatsOverview badges={badges} />

          <BadgeGrid
            badges={badges}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filter}
            setFilter={setFilter}
            onClaimBadge={handleClaimBadge}
            loading={loading}
          />

          <ConfirmClaimModal
            isOpen={showClaimModal}
            onClose={() => setShowClaimModal(false)}
            onConfirm={confirmClaim}
            badge={selectedBadge}
            isClaiming={isClaiming}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BadgesAndRewards;