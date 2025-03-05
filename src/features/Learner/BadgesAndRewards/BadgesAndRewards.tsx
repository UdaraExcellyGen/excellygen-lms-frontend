import React, { useState } from 'react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';
import { Badge } from './types/Badge';
import { badgesData } from './data/badges';
import PageHeader from './components/PageHeader';
import StatsOverview from './components/StatsOverview';
import BadgeGrid from './components/BadgeGrid';
import ConfirmClaimModal from './components/ConfirmClaimModal';


import '../../../styles/animations.css';

const BadgesAndRewards: React.FC = () => {
 
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [badges, setBadges] = useState<Badge[]>(badgesData);

  const handleClaimBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowClaimModal(true);
  };

  const confirmClaim = () => {
    if (selectedBadge) {
      
      setBadges(
        badges.map(badge => 
          badge.id === selectedBadge.id
            ? { 
                ...badge, 
                isUnlocked: true,
                dateEarned: new Date().toISOString().split('T')[0]
              }
            : badge
        )
      );
    }
    setShowClaimModal(false);
    setSelectedBadge(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          <PageHeader 
            title="Learning Achievements" 
            subtitle="Track your progress and earn recognition for your learning journey"
          />
          
          <StatsOverview badges={badges} />
          
          <BadgeGrid 
            badges={badges} 
            onClaimBadge={handleClaimBadge} 
          />
        </div>
      </div>

      <ConfirmClaimModal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setSelectedBadge(null);
        }}
        onConfirm={confirmClaim}
        badge={selectedBadge}
      />
    </Layout>
  );
};

export default BadgesAndRewards;