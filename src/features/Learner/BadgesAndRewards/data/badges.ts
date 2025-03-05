import { 
    Trophy, Award, Star, Users, Calendar, Compass
  } from 'lucide-react';
  import { Badge } from '../types/Badge';
  
  export const badgesData: Badge[] = [
    {
      id: 1,
      title: "Perfectionist",
      description: "Score 100% on 3 quizzes in a row",
      icon: Trophy,
      currentProgress: 2,
      targetProgress: 3,
      isUnlocked: false,
      category: 'achievement'
    },
    {
      id: 2,
      title: "Fast Learner",
      description: "Complete three courses in less than 50% of estimated time",
      icon: Star,
      currentProgress: 3,
      targetProgress: 3,
      isUnlocked: true,
      category: 'learning',
      dateEarned: "2024-02-15"
    },
    {
      id: 3,
      title: "Top Performer",
      description: "Rank in the top 5 learners of a month",
      icon: Award,
      currentProgress: 1,
      targetProgress: 1,
      isUnlocked: true,
      category: 'achievement',
      dateEarned: "2024-02-10"
    },
    {
      id: 4,
      title: "Helping Hand",
      description: "Answer 10 learner questions in the forum",
      icon: Users,
      currentProgress: 7,
      targetProgress: 10,
      isUnlocked: false,
      category: 'community'
    },
    {
      id: 5,
      title: "Daily Learner",
      description: "Study 5 days in a row with 1-hour goal",
      icon: Calendar,
      currentProgress: 3,
      targetProgress: 5,
      isUnlocked: false,
      category: 'learning'
    },
    {
      id: 6,
      title: "Explorer",
      description: "Complete courses from 3+ different learning paths",
      icon: Compass,
      currentProgress: 2,
      targetProgress: 3,
      isUnlocked: false,
      category: 'learning'
    }
  ];