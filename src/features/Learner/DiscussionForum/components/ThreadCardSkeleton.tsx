// src/features/Learner/DiscussionForum/components/ThreadCardSkeleton.tsx
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ThreadCardSkeleton: React.FC = () => {
    return (
        <SkeletonTheme baseColor="#e0d1f0" highlightColor="#f5eefc">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-purple-300/40 shadow-md overflow-hidden p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    <Skeleton circle height={40} width={40} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className='w-3/4'>
                                <Skeleton height={24} width="80%" />
                                <Skeleton height={14} width="50%" style={{ marginTop: '4px' }} />
                            </div>
                            <div className="flex items-center gap-1">
                                <Skeleton height={20} width={20} />
                                <Skeleton height={20} width={20} />
                            </div>
                        </div>
                        <div className="mt-2">
                           <Skeleton count={2} />
                        </div>
                        <div className="mt-3 pt-3 flex items-center justify-between border-t border-purple-200/30">
                            <Skeleton height={20} width={100} borderRadius={999} />
                            <Skeleton height={20} width={100} />
                        </div>
                    </div>
                </div>
            </div>
        </SkeletonTheme>
    );
};

export default ThreadCardSkeleton;