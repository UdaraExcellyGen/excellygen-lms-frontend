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

// --------- Thread Types ---------
export interface ForumThreadDto {
    id: number; 
    title: string;
    content: string; 
    category: string;
    imageUrl?: string; 
    createdAt: string; // ISO 8601 date string
    author: AuthorDto | null;
    commentsCount: number;
    isCurrentUserAuthor: boolean;

    // Frontend UI state for DiscussionForum.tsx component
    showComments?: boolean;
    isLoadingComments?: boolean;
}

export interface CreateForumThreadDto {
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
}

export interface UpdateForumThreadDto {
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
}

export interface ThreadFormData { // For Create/Edit Thread Modals in frontend
    title: string;
    content: string;
    category: string;
    image?: File | null;     
    imagePreview?: string;   
    imageUrl?: string;       // Holds URL from server (either existing or after new upload for DTO)
    currentRelativePath?: string; // Relative path from server, for deletion if image is changed/removed
}


// --------- Comment Types ---------
export interface ThreadCommentDto {
    id: number; 
    content: string;
    createdAt: string;
    author: AuthorDto | null;
    threadId: number; 
    repliesCount: number;
    isCurrentUserAuthor: boolean;

    // Frontend UI state for CommentSection.tsx component
    showReplies?: boolean;
    replies?: ThreadReplyDto[]; 
    isLoadingReplies?: boolean;
    isPostingReply?: boolean;
    replyError?: string | null;
}

export interface CreateThreadCommentDto {
    content: string;
}

export interface UpdateThreadCommentDto { 
    content: string;
}

export interface CommentFormData { // For EditCommentModal
    content: string;
}


// --------- Reply Types ---------
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

// ReplyFormData can be the same as CommentFormData if only content is editable
// export interface ReplyFormData { 
//     content: string;
// }