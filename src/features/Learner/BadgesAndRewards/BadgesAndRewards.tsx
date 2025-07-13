// src/features/Learner/BadgesAndRewards/BadgesAndRewards.tsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import Layout from '../../../components/Sidebar/Layout';
import PageHeader from './components/PageHeader';
import StatsOverview from './components/StatsOverview';
import BadgeGrid from './components/BadgeGrid';
import ConfirmClaimModal from './components/ConfirmClaimModal';
import { Badge } from './types/Badge';
import { badgesData } from './data/badges';

const BadgesAndRewards: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>(badgesData);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const handleClaimBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowClaimModal(true);
  };

  const confirmClaim = () => {
    if (selectedBadge) {
      setBadges(badges.map(badge => 
        badge.id === selectedBadge.id
          ? { 
              ...badge, 
              isUnlocked: true,
              dateEarned: new Date().toISOString().split('T')[0]
            }
          : badge
      ));
      toast.success(`${selectedBadge.title} badge claimed successfully!`);
    }
    setShowClaimModal(false);
    setSelectedBadge(null);
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 bg-gradient-to-b from-indigo to-persian-indigo">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          
          {/* Page Header */}
          <PageHeader 
            title="Learning Achievements"
            subtitle="Track your progress and earn recognition for your learning journey"
          />

          {/* Error Display */}
          {error && !loading && (
            <div className="bg-red-100 border-l-4 border-status-error text-red-700 p-4 rounded-md mb-6 flex items-center gap-3 font-nunito" role="alert">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <StatsOverview badges={badges} />

          {/* Badge Grid with Search and Filters */}
          <BadgeGrid
            badges={badges}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filter}
            setFilter={setFilter}
            onClaimBadge={handleClaimBadge}
            loading={loading}
            error={error}
          />

          {/* Claim Modal */}
          <ConfirmClaimModal
            isOpen={showClaimModal}
            onClose={() => {
              setShowClaimModal(false);
              setSelectedBadge(null);
            }}
            onConfirm={confirmClaim}
            badge={selectedBadge}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BadgesAndRewards;