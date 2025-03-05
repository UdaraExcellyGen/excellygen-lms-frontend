import React, { useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import Layout from '../../../components/Layout/Sidebar/Layout/Layout';
import ConfirmClaimModal from './components/ConfirmClaimModal';
import { INITIAL_BADGES } from './data/BadgeData';
import { Badge } from './types/BadgeTypes';
import { 
  calculateProgressPercentage, 
  countEarnedBadges 
} from './utils/badgeUtils';

const BadgesAndRewards: React.FC = () => {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  const handleClaimBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowClaimModal(true);
  };

  const confirmClaim = () => {
    const updatedBadges = badges.map(b => 
      b.id === selectedBadge?.id 
        ? { ...b, isUnlocked: true, dateEarned: new Date().toISOString() } 
        : b
    );
    setBadges(updatedBadges);
    setShowClaimModal(false);
    setSelectedBadge(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] p-6">
        <div className="max-w-7xl mx-auto px-8 space-y-8">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-3xl text-center font-bold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">
              Learning Achievements
            </h1>
            <p className="text-[#D68BF9] text-center mt-1">
              Track your progress and earn recognition for your learning journey
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { 
                icon: Trophy, 
                label: 'Total Badges', 
                value: badges.length,
                color: 'from-amber-400 to-amber-600'
              },
              { 
                icon: Award, 
                label: 'Badges Earned', 
                value: `${countEarnedBadges(badges)}/${badges.length}`,
                color: 'from-indigo-400 to-indigo-600'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-[#BF4BF6]/20 shadow-md hover:border-[#BF4BF6]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[#52007C] font-nunito font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1B0A3F] mt-1 font-unbounded">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map(badge => {
              const Icon = badge.icon;
              const progressPercentage = calculateProgressPercentage(badge);
              
              return (
                <div
                  key={badge.id}
                  className={`relative group transition-all duration-500 hover:-translate-y-1
                    ${badge.isUnlocked 
                      ? 'hover:shadow-[0_8px_30px_rgb(191,75,246,0.2)]' 
                      : 'opacity-80 hover:opacity-100'
                    }`}
                >
                  {/* Card Content (similar to previous implementation) */}
                  {/* ... render badge details ... */}
                  
                  {badge.currentProgress >= badge.targetProgress && !badge.isUnlocked && (
                    <button
                      onClick={() => handleClaimBadge(badge)}
                      className="px-6 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] 
                        text-white rounded-lg font-nunito text-sm
                        hover:from-[#D68BF9] hover:to-[#BF4BF6] 
                        transform hover:scale-105 hover:shadow-lg hover:shadow-[#BF4BF6]/20
                        transition-all duration-300 active:scale-95"
                    >
                      Claim Badge
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
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