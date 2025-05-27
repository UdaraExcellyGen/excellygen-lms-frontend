// src/pages/DiscussionForum/types/dto.ts

// --------- Shared within Forum Feature (and for API matching) ---------
export interface AuthorDto {
    id: string; 
    name: string;
    avatar?: string; 
}

export interface ForumQueryParams {
    SearchTerm?: string;
    Category?: string;
    MyThreads?: boolean;
    PageNumber?: number;
    PageSize?: number;
}

export interface PagedResult<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// --------- Frontend Select Option Types ---------
export interface CategorySelectOption {
    value: string; 
    label: string; 
}

// --------- Thread Types ---------
export interface ForumThreadDto {
    id: number; 
    title: string;
    content: string; 
    category: string; 
    imageUrl: string | null; // Matches backend nullable string
    createdAt: string;
    updatedAt?: string; // Add optional updatedAt for frontend display
    author: AuthorDto | null;
    commentsCount: number;
    isCurrentUserAuthor: boolean;
    showComments?: boolean; // Frontend-only state
    isLoadingComments?: boolean; // Frontend-only state
}

export interface CreateForumThreadDto {
    title: string;
    content: string;
    category: string;
    imageUrl?: string | null; // Matches backend property name
}

export interface UpdateForumThreadDto {
    title: string;
    content: string;
    category: string;
    imageUrl?: string | null; // Matches backend property name
    removeCurrentImage?: boolean;
}

export interface ThreadFormData {
    title: string;
    content: string;
    category: string;
    image?: File | null;     
    imagePreview?: string;   
    imageUrl?: string | null; // For displaying uploaded image
    currentRelativePath?: string | null; // For backward compatibility
}

// --------- Comment & Reply DTOs ---------
export interface ThreadCommentDto {
    id: number; 
    content: string;
    createdAt: string;
    author: AuthorDto | null;
    threadId: number; 
    repliesCount: number;
    isCurrentUserAuthor: boolean;
    showReplies?: boolean; // Frontend-only state
    replies?: ThreadReplyDto[]; // Frontend-only state 
    isLoadingReplies?: boolean; // Frontend-only state
    isPostingReply?: boolean; // Frontend-only state
    replyError?: string | null; // Frontend-only state
}

export interface CreateThreadCommentDto { 
    content: string; 
}

export interface UpdateThreadCommentDto { 
    content: string; 
}

export interface CommentFormData { 
    content: string; 
} 

export interface ThreadReplyDto { 
    id: number; 
    content: string;
    createdAt: string;
    author: AuthorDto | null;
    commentId: number; 
    isCurrentUserAuthor: boolean;
}

export interface CreateThreadReplyDto { 
    content: string; 
}

export interface UpdateThreadReplyDto { 
    content: string; 
}