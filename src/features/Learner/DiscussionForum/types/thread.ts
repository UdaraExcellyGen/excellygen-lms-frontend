export interface Thread {
    id: string;
    title: string;
    category: string;
    timestamp: string;
    content: string;
    commentsCount: number;
    authorName: string;
    authorAvatar: string;
    image?: string;
    isCurrentUser: boolean;
    showComments?: boolean;
}

export interface Comment {
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    timestamp: string;
    replies: Reply[];
}

export interface Reply {
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    timestamp: string;
    timestamp: string;
}

export interface ThreadFormData {
    content: string;
    title: string;
    category: string;
    image: File | null;
    imagePreview?: string;
}