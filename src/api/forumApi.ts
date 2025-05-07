// src/api/forumApi.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { // Import DTOs from the new location
    ForumQueryParams, PagedResult, ForumThreadDto, CreateForumThreadDto, UpdateForumThreadDto,
    ThreadCommentDto, CreateThreadCommentDto, UpdateThreadCommentDto,
    ThreadReplyDto, CreateThreadReplyDto, UpdateThreadReplyDto
} from '../features/Learner/DiscussionForum/types/dto'; // <--- CORRECTED IMPORT PATH
import { refreshToken as apiAuthRefreshToken } from './authApi'; // Assuming this is at src/api/authApi.ts

// ... (Rest of the forumApiClient setup and API functions from modal_26 remains the same)
const TOKEN_STORAGE_KEY = 'access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'token_expiry';
const CURRENT_ROLE_STORAGE_KEY = 'current_role';

const forumApiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/forum`, 
    headers: { 'Content-Type': 'application/json' },
});

let isCurrentlyRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
}
function addRefreshSubscriber(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

forumApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

forumApiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (!originalRequest) return Promise.reject(error);

        const tokenExpiredHeader = error.response?.headers && (error.response.headers['token-expired'] === 'true' || error.response.headers['Token-Expired'] === 'true');
        const errorMessageIndicatesExpiry = 
            (typeof error.response?.data === 'string' && error.response.data.toLowerCase().includes("token expired")) ||
            (typeof (error.response?.data as any)?.message === 'string' && (error.response?.data as any).message.toLowerCase().includes("token expired"));

        if (error.response?.status === 401 && (tokenExpiredHeader || errorMessageIndicatesExpiry) && !originalRequest._retry) {
            if (!isCurrentlyRefreshing) {
                isCurrentlyRefreshing = true;
                originalRequest._retry = true;
                console.log("Forum API: Access token expired/invalid, attempting refresh...");
                try {
                    const newTokenData = await apiAuthRefreshToken(); 
                    localStorage.setItem(TOKEN_STORAGE_KEY, newTokenData.accessToken);
                    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newTokenData.refreshToken);
                    localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, newTokenData.expiresAt);
                    localStorage.setItem(CURRENT_ROLE_STORAGE_KEY, newTokenData.currentRole);
                    console.log("Forum API: Token refreshed successfully.");
                    toast.success("Session renewed.", { duration: 2000 });
                    isCurrentlyRefreshing = false;
                    onRefreshed(newTokenData.accessToken);
                    if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${newTokenData.accessToken}`;
                    return forumApiClient(originalRequest);
                } catch (refreshError: any) {
                    console.error("Forum API: Token refresh failed:", refreshError);
                    isCurrentlyRefreshing = false;
                    refreshSubscribers = [];
                    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { message: 'Session expired. Please login again.' } }));
                    toast.error('Session expired.');
                    return Promise.reject(refreshError);
                }
            } else {
                originalRequest._retry = true;
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken: string) => {
                        if (originalRequest.headers) originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(forumApiClient(originalRequest));
                    });
                });
            }
        }
        if (error.response?.data && (error.response.data as any).message) {
            return Promise.reject(new Error((error.response.data as any).message));
        }
        return Promise.reject(error);
    }
);

export const getThreads = async (params: ForumQueryParams): Promise<PagedResult<ForumThreadDto>> => {
    const queryParams = new URLSearchParams();
    if (params.PageNumber) queryParams.append('PageNumber', params.PageNumber.toString());
    if (params.PageSize) queryParams.append('PageSize', params.PageSize.toString());
    if (params.SearchTerm) queryParams.append('SearchTerm', params.SearchTerm);
    if (params.Category && params.Category !== 'all') queryParams.append('Category', params.Category);
    if (params.MyThreads) queryParams.append('MyThreads', 'true');
    const response = await forumApiClient.get<PagedResult<ForumThreadDto>>(`/threads`, { params: queryParams });
    return response.data;
};
export const getThreadById = async (threadId: number): Promise<ForumThreadDto> => 
    (await forumApiClient.get<ForumThreadDto>(`/threads/${threadId}`)).data;
export const createThread = async (data: CreateForumThreadDto): Promise<ForumThreadDto> =>
    (await forumApiClient.post<ForumThreadDto>(`/threads`, data)).data;
export const updateThread = async (threadId: number, data: UpdateForumThreadDto): Promise<ForumThreadDto> =>
    (await forumApiClient.put<ForumThreadDto>(`/threads/${threadId}`, data)).data;
export const deleteThread = async (threadId: number): Promise<void> =>
    await forumApiClient.delete(`/threads/${threadId}`);

export const getCommentsForThread = async (threadId: number): Promise<ThreadCommentDto[]> =>
    (await forumApiClient.get<ThreadCommentDto[]>(`/threads/${threadId}/comments`)).data;
export const createCommentOnThread = async (threadId: number, data: CreateThreadCommentDto): Promise<ThreadCommentDto> =>
    (await forumApiClient.post<ThreadCommentDto>(`/threads/${threadId}/comments`, data)).data;
export const updateComment = async (commentId: number, data: UpdateThreadCommentDto): Promise<ThreadCommentDto> =>
    (await forumApiClient.put<ThreadCommentDto>(`/comments/${commentId}`, data)).data;
export const deleteComment = async (commentId: number): Promise<void> =>
    await forumApiClient.delete(`/comments/${commentId}`);

export const getRepliesForComment = async (commentId: number): Promise<ThreadReplyDto[]> =>
    (await forumApiClient.get<ThreadReplyDto[]>(`/comments/${commentId}/replies`)).data;
export const createReplyToComment = async (commentId: number, data: CreateThreadReplyDto): Promise<ThreadReplyDto> =>
    (await forumApiClient.post<ThreadReplyDto>(`/comments/${commentId}/replies`, data)).data;
export const updateReply = async (replyId: number, data: UpdateThreadReplyDto): Promise<ThreadReplyDto> =>
    (await forumApiClient.put<ThreadReplyDto>(`/replies/${replyId}`, data)).data;
export const deleteReply = async (replyId: number): Promise<void> =>
    await forumApiClient.delete(`/replies/${replyId}`);

export function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}