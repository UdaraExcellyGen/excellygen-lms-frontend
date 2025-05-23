import apiClient from './apiClient'; // <--- USE THE GLOBAL apiClient FROM YOUR modal_44
import {
    ForumQueryParams, PagedResult, ForumThreadDto, CreateForumThreadDto, UpdateForumThreadDto,
    ThreadCommentDto, CreateThreadCommentDto, UpdateThreadCommentDto,
    ThreadReplyDto, CreateThreadReplyDto, UpdateThreadReplyDto
} from '../features/Learner/DiscussionForum/types/dto'; // Adjust path as per your project
import { AxiosError } from 'axios';

const BASE_URL = '/forum'; // This will be appended to apiClient's baseURL (e.g., /api/forum)

// --- Thread API Functions ---
export const getThreads = async (params: ForumQueryParams): Promise<PagedResult<ForumThreadDto>> => {
    const queryParams = new URLSearchParams();
    if (params.PageNumber) queryParams.append('PageNumber', params.PageNumber.toString());
    if (params.PageSize) queryParams.append('PageSize', params.PageSize.toString());
    if (params.SearchTerm) queryParams.append('SearchTerm', params.SearchTerm);
    if (params.Category && params.Category !== 'all') queryParams.append('Category', params.Category);
    if (params.MyThreads) queryParams.append('MyThreads', 'true');
    
    const response = await apiClient.get<PagedResult<ForumThreadDto>>(`${BASE_URL}/threads`, { params: queryParams });
    return response.data;
};

export const getThreadById = async (threadId: number): Promise<ForumThreadDto> => 
    (await apiClient.get<ForumThreadDto>(`${BASE_URL}/threads/${threadId}`)).data;

export const createThread = async (data: CreateForumThreadDto): Promise<ForumThreadDto> =>
    (await apiClient.post<ForumThreadDto>(`${BASE_URL}/threads`, data)).data;

export const updateThread = async (threadId: number, data: UpdateForumThreadDto): Promise<ForumThreadDto> =>
    (await apiClient.put<ForumThreadDto>(`${BASE_URL}/threads/${threadId}`, data)).data;

export const deleteThread = async (threadId: number): Promise<void> =>
    await apiClient.delete(`${BASE_URL}/threads/${threadId}`);

// --- Comment API Functions ---
export const getCommentsForThread = async (threadId: number): Promise<ThreadCommentDto[]> =>
    (await apiClient.get<ThreadCommentDto[]>(`${BASE_URL}/threads/${threadId}/comments`)).data;

export const createCommentOnThread = async (threadId: number, data: CreateThreadCommentDto): Promise<ThreadCommentDto> =>
    (await apiClient.post<ThreadCommentDto>(`${BASE_URL}/threads/${threadId}/comments`, data)).data;

export const updateComment = async (commentId: number, data: UpdateThreadCommentDto): Promise<ThreadCommentDto> =>
    (await apiClient.put<ThreadCommentDto>(`${BASE_URL}/comments/${commentId}`, data)).data;

export const deleteComment = async (commentId: number): Promise<void> =>
    await apiClient.delete(`${BASE_URL}/comments/${commentId}`);

// --- Reply API Functions ---
export const getRepliesForComment = async (commentId: number): Promise<ThreadReplyDto[]> =>
    (await apiClient.get<ThreadReplyDto[]>(`${BASE_URL}/comments/${commentId}/replies`)).data;

export const createReplyToComment = async (commentId: number, data: CreateThreadReplyDto): Promise<ThreadReplyDto> =>
    (await apiClient.post<ThreadReplyDto>(`${BASE_URL}/comments/${commentId}/replies`, data)).data;

export const updateReply = async (replyId: number, data: UpdateThreadReplyDto): Promise<ThreadReplyDto> =>
    (await apiClient.put<ThreadReplyDto>(`${BASE_URL}/replies/${replyId}`, data)).data;

export const deleteReply = async (replyId: number): Promise<void> =>
    await apiClient.delete(`${BASE_URL}/replies/${replyId}`);

// Helper to check if an error is an AxiosError
export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}