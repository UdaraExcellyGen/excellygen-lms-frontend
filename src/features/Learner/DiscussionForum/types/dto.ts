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
export interface CategorySelectOption { // <-- ENSURE THIS IS PRESENT
    value: string; 
    label: string; 
}

// --------- Thread Types ---------
export interface ForumThreadDto {
    id: number; 
    title: string;
    content: string; 
    category: string; // This is the category title string
    imageUrl?: string; 
    createdAt: string;
    author: AuthorDto | null;
    commentsCount: number;
    isCurrentUserAuthor: boolean;
    showComments?: boolean;
    isLoadingComments?: boolean;
}

export interface CreateForumThreadDto {
    title: string;
    content: string;
    category: string; // Category title string
    imageRelativePath?: string; // Changed from imageUrl to relative path
}

export interface UpdateForumThreadDto {
    title: string;
    content: string;
    category: string; // Category title string
    imageRelativePath?: string; // Changed from imageUrl
    removeCurrentImage?: boolean;
}

export interface ThreadFormData {
    title: string;
    content: string;
    category: string; // Selected category title string
    image?: File | null;     
    imagePreview?: string;   
    imageUrl?: string; // Full URL from server (after upload or initial load)
    currentRelativePath?: string; // Relative path of the image on the server
}

// --------- Comment & Reply DTOs (as defined in modal_33) ---------
export interface ThreadCommentDto { /* ... */ 
    id: number; 
    content: string;
    createdAt: string;
    author: AuthorDto | null;
    threadId: number; 
    repliesCount: number;
    isCurrentUserAuthor: boolean;
    showReplies?: boolean;
    replies?: ThreadReplyDto[]; 
    isLoadingReplies?: boolean;
    isPostingReply?: boolean;
    replyError?: string | null;
}
export interface CreateThreadCommentDto { /* ... */ content: string; }
export interface UpdateThreadCommentDto { /* ... */ content: string; }
export interface CommentFormData { content: string; } 

export interface ThreadReplyDto { /* ... */ 
    id: number; 
    content: string;
    createdAt: string;
    author: AuthorDto | null;
    commentId: number; 
    isCurrentUserAuthor: boolean;
}
export interface CreateThreadReplyDto { /* ... */ content: string; }
export interface UpdateThreadReplyDto { /* ... */ content: string; }