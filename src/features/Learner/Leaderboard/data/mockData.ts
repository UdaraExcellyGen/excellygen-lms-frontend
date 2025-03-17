// Course categories
export const courseCategories = [
  { id: 'all', name: 'All' },
  { id: 'software-engineering', name: 'Software Engineering' },
  { id: 'quality-assurance', name: 'Quality Assurance' },
  { id: 'devops', name: 'DevOps' }
];

// Sample data with updated names
export const initialData = {
  'all': [
    {
      rank: 1,
      name: "Asitha Udara",
      avatar: "AU",
      title: "Full Stack Developer",
      points: 2850,
      achievements: 15,
      completedCourses: 12,
      rankChange: 2
    },
    {
      rank: 2,
      name: "Mehara Rothila",
      avatar: "MR",
      title: "Software Engineer",
      points: 2720,
      achievements: 13,
      completedCourses: 10,
      rankChange: -1
    },
    {
      rank: 3,
      name: "Sehani Silva",
      avatar: "SS",
      title: "Frontend Developer",
      points: 2680,
      achievements: 12,
      completedCourses: 9,
      rankChange: 1
    },
    {
      rank: 4,
      name: "Shamini Nirodya",
      avatar: "SN",
      title: "Backend Developer",
      points: 2450,
      achievements: 11,
      completedCourses: 8,
      rankChange: 0
    },
    {
      rank: 5,
      name: "Dilkini Kahawalage",
      avatar: "DK",
      title: "Software Engineer",
      points: 2380,
      achievements: 10,
      completedCourses: 7,
      rankChange: 3,
      isCurrentUser: true
    }
  ],
  'software-engineering': [
    {
      rank: 1,
      name: "Asitha Udara",
      avatar: "AU",
      title: "Full Stack Developer",
      points: 3250,
      achievements: 17,
      completedCourses: 14,
      rankChange: 0
    },
    {
      rank: 2,
      name: "Mehara Rothila",
      avatar: "MR",
      title: "Software Engineer",
      points: 2980,
      achievements: 15,
      completedCourses: 12,
      rankChange: 1
    },
    {
      rank: 3,
      name: "Dilkini Kahawalage",
      avatar: "DK",
      title: "Software Engineer",
      points: 2540,
      achievements: 12,
      completedCourses: 10,
      rankChange: 2,
      isCurrentUser: true
    }
  ],
  'quality-assurance': [
    {
      rank: 1,
      name: "Shamini Nirodya",
      avatar: "SN",
      title: "QA Engineer",
      points: 2780,
      achievements: 14,
      completedCourses: 11,
      rankChange: 2
    },
    {
      rank: 2,
      name: "Sehani Silva",
      avatar: "SS",
      title: "Test Automation Engineer",
      points: 2650,
      achievements: 13,
      completedCourses: 9,
      rankChange: -1
    },
    {
      rank: 3,
      name: "Dilkini Kahawalage",
      avatar: "DK",
      title: "QA Specialist",
      points: 2100,
      achievements: 8,
      completedCourses: 6,
      rankChange: 0,
      isCurrentUser: true
    }
  ],
  'devops': [
    {
      rank: 1,
      name: "Dilkini Kahawalage",
      avatar: "DK",
      title: "DevOps Engineer",
      points: 2950,
      achievements: 16,
      completedCourses: 13,
      rankChange: 0,
      isCurrentUser: true
    },
    {
      rank: 2,
      name: "Mehara Rothila",
      avatar: "MR",
      title: "Cloud Engineer",
      points: 2840,
      achievements: 14,
      completedCourses: 11,
      rankChange: 1
    },
    {
      rank: 3,
      name: "Asitha Udara",
      avatar: "AU",
      title: "Infrastructure Specialist",
      points: 2460,
      achievements: 11,
      completedCourses: 9,
      rankChange: -1
    }
  ]
};