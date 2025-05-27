// src/api/forumApi.ts
import axios, { AxiosError } from 'axios';
import apiClient from './apiClient';
import { 
  CreateForumThreadDto, 
  UpdateForumThreadDto, 
  ForumThreadDto, 
  ForumQueryParams, 
  PagedResult,
  ThreadCommentDto,
  CreateThreadCommentDto,
  UpdateThreadCommentDto,
  ThreadReplyDto,
  CreateThreadReplyDto,
  UpdateThreadReplyDto
} from '../pages/DiscussionForum/types/dto';

// Export isAxiosError helper
export const isAxiosError = (error: any): error is AxiosError => {
  return error.isAxiosError === true;
};

/**
 * Get threads with optional filtering
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paged result of threads
 */
export const getThreads = async (params: ForumQueryParams): Promise<PagedResult<ForumThreadDto>> => {
  // Remove the /api prefix since apiClient.baseURL already includes it
  const response = await apiClient.get('/forum/threads', { params });
  return response.data;
};

/**
 * Get a single thread by ID
 * @param id Thread ID
 * @returns Promise with the thread details
 */
export const getThread = async (id: number | string): Promise<ForumThreadDto> => {
  const response = await apiClient.get(`/forum/threads/${id}`);
  return response.data;
};

/**
 * Creates a new forum thread
 * @param createDto Data to create the thread
 * @returns Promise with the created thread
 */
export const createThread = async (createDto: CreateForumThreadDto): Promise<ForumThreadDto> => {
  console.log('Creating thread with data:', createDto);
  const response = await apiClient.post('/forum/threads', createDto);
  return response.data;
};

/**
 * Updates an existing forum thread
 * @param id Thread ID
 * @param updateDto Data to update the thread
 * @returns Promise with the updated thread
 */
export const updateThread = async (id: number | string, updateDto: UpdateForumThreadDto): Promise<ForumThreadDto> => {
  const response = await apiClient.put(`/forum/threads/${id}`, updateDto);
  return response.data;
};

/**
 * Deletes a thread
 * @param id Thread ID
 * @returns Promise with deletion result
 */
export const deleteThread = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/forum/threads/${id}`);
};

/**
 * Get comments for a thread
 * @param threadId Thread ID
 * @returns Promise with list of comments
 */
export const getComments = async (threadId: number | string): Promise<ThreadCommentDto[]> => {
  const response = await apiClient.get(`/forum/threads/${threadId}/comments`);
  return response.data;
};

/**
 * Creates a new comment on a thread
 * @param threadId Thread ID
 * @param createDto Comment data
 * @returns Promise with the created comment
 */
export const createComment = async (threadId: number | string, createDto: CreateThreadCommentDto): Promise<ThreadCommentDto> => {
  const response = await apiClient.post(`/forum/threads/${threadId}/comments`, createDto);
  return response.data;
};

/**
 * Updates an existing comment
 * @param commentId Comment ID
 * @param updateDto Updated comment data
 * @returns Promise with updated comment
 */
export const updateComment = async (commentId: number | string, updateDto: UpdateThreadCommentDto): Promise<ThreadCommentDto> => {
  const response = await apiClient.put(`/forum/comments/${commentId}`, updateDto);
  return response.data;
};

/**
 * Deletes a comment
 * @param commentId Comment ID
 * @returns Promise with deletion result
 */
export const deleteComment = async (commentId: number | string): Promise<void> => {
  await apiClient.delete(`/forum/comments/${commentId}`);
};

/**
 * Get replies for a comment
 * @param commentId Comment ID
 * @returns Promise with list of replies
 */
export const getReplies = async (commentId: number | string): Promise<ThreadReplyDto[]> => {
  const response = await apiClient.get(`/forum/comments/${commentId}/replies`);
  return response.data;
};

/**
 * Creates a new reply on a comment
 * @param commentId Comment ID
 * @param createDto Reply data
 * @returns Promise with the created reply
 */
export const createReply = async (commentId: number | string, createDto: CreateThreadReplyDto): Promise<ThreadReplyDto> => {
  const response = await apiClient.post(`/forum/comments/${commentId}/replies`, createDto);
  return response.data;
};

/**
 * Updates an existing reply
 * @param replyId Reply ID
 * @param updateDto Updated reply data
 * @returns Promise with updated reply
 */
export const updateReply = async (replyId: number | string, updateDto: UpdateThreadReplyDto): Promise<ThreadReplyDto> => {
  const response = await apiClient.put(`/forum/replies/${replyId}`, updateDto);
  return response.data;
};

/**
 * Deletes a reply
 * @param replyId Reply ID
 * @returns Promise with deletion result
 */
export const deleteReply = async (replyId: number | string): Promise<void> => {
  await apiClient.delete(`/forum/replies/${replyId}`);
};