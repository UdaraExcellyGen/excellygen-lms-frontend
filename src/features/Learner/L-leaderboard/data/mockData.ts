import {Learner} from "../types/leaderboard";

export const initialData: Learner[] = [
  {
    rank: 1,
    name: "Sarah Johnson",
    avatar: "SJ",
    title: "Full Stack Developer",
    points: 2850,
    achievements: 15,
    completedCourses: 12,
    rankChange: 2
  },
  {
    rank: 2,
    name: "Mike Chen",
    avatar: "MC",
    title: "Software Engineer",
    points: 2720,
    achievements: 13,
    completedCourses: 10,
    rankChange: -1
  },
  {
    rank: 3,
    name: "Emma Davis",
    avatar: "ED",
    title: "Frontend Developer",
    points: 2680,
    achievements: 12,
    completedCourses: 9,
    rankChange: 1
  },
  {
    rank: 4,
    name: "Alex Turner",
    avatar: "AT",
    title: "Backend Developer",
    points: 2450,
    achievements: 11,
    completedCourses: 8,
    rankChange: 0
  },
  {
    rank: 5,
    name: "Anna Morrish",
    avatar: "AM",
    title: "Software Engineer",
    points: 2380,
    achievements: 10,
    completedCourses: 7,
    rankChange: 3,
    isCurrentUser: true
  }
];