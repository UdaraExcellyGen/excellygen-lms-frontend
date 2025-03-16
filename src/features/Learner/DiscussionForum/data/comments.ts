import { Comment } from '../types/thread';

const initialComments: { [threadId: string]: Comment[] } = {
    '1': [
        {
            id: 'c1-1',
            content: "Great insights on code reviews! I've found that using automated tools alongside manual reviews really helps.",
            authorName: 'James Wilson',
            authorAvatar: '/avatars/james.jpg',
            timestamp: '1 hour ago',
            replies: [
                {
                    id: 'r1-1-1',
                    content: "Agreed! Which tools do you recommend for this purpose?",
                    authorName: 'Anna Morrish',
                    authorAvatar: '/avatars/anna.jpg',
                    timestamp: '45 minutes ago'
                }
            ]
        },
        {
            id: 'c1-2',
            content: "I think pair programming sessions before code reviews can significantly reduce the number of issues found later.",
            authorName: 'Lisa Chen',
            authorAvatar: '/avatars/lisa.jpg',
            timestamp: '2 hours ago',
            replies: []
        }
    ],
    '2': [
        {
            id: 'c2-1',
            content: "Test automation has been a game changer for our team. We've reduced regression testing time by 70%.",
            authorName: 'Michael Brown',
            authorAvatar: '/avatars/michael.jpg',
            timestamp: '3 hours ago',
            replies: []
        }
    ],
    '3': [
        {
            id: 'c3-1',
            content: "I've found that a hybrid approach works best for most enterprise projects.",
            authorName: 'Emma Davis',
            authorAvatar: '/avatars/emma.jpg',
            timestamp: '12 hours ago',
            replies: [
                {
                    id: 'r3-1-1',
                    content: "Could you elaborate on how you structure the hybrid approach?",
                    authorName: 'John Smith',
                    authorAvatar: '/avatars/john.jpg',
                    timestamp: '10 hours ago'
                }
            ]
        }
    ]
};

export default initialComments;