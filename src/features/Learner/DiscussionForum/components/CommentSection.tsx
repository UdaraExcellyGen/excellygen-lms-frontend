// src/pages/DiscussionForum/components/CommentSection.tsx
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { RefreshCw, Send, MessageCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import * as forumApi from '../../../../api/forumApi'; // Adjust path to your forumApi.ts
import { refreshToken as attemptTokenRefresh } from '../../../../api/authApi'; // Adjust path
import { 
    ThreadCommentDto, ThreadReplyDto, CreateThreadCommentDto, UpdateThreadCommentDto,
    CreateThreadReplyDto, UpdateThreadReplyDto, CommentFormData
} from '../types/dto'; // Adjust path to your dto.ts
import { useAuth } from '../../../../../src/contexts/AuthContext'; // Adjust path
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import DeleteItemDialog from './DeleteItemDialog'; // Assuming DeleteItemDialog.tsx is in the same folder

// --- Helper Modal Components (Can be moved to separate files for better organization) ---
interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: string;
    onSubmit: (newContent: string) => Promise<void>; // Parent handles actual API call & loading
    title: string; // "Edit Comment" or "Edit Reply"
    isSubmitting?: boolean; // Optional: if parent wants to control submitting state display
}

const EditItemModal: React.FC<EditItemModalProps> = ({ 
    isOpen, 
    onClose, 
    initialContent, 
    onSubmit, 
    title,
    isSubmitting: parentIsSubmitting // Renamed to avoid conflict with local state
}) => {
    const [content, setContent] = useState(initialContent);
    const [isProcessing, setIsProcessing] = useState(false); // Local submitting state

    useEffect(() => {
        if (isOpen) { // Reset content when modal opens with new initial data
            setContent(initialContent);
            setIsProcessing(false);
        }
    }, [initialContent, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            toast.error("Content cannot be empty.");
            return;
        }
        setIsProcessing(true);
        try {
            await onSubmit(content); // Parent's onSubmit will handle API call and closing modal
        } catch (err) {
            // Error already toasted by parent
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    const actualIsSubmitting = parentIsSubmitting || isProcessing;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-[#1B0A3F]">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <textarea 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded min-h-[100px] text-sm font-nunito text-[#1B0A3F] border-[#BF4BF6]/50 focus:ring-1 focus:ring-[#BF4BF6]"
                        required 
                        disabled={actualIsSubmitting}
                        rows={5}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} disabled={actualIsSubmitting} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-nunito">Cancel</button>
                        <button type="submit" disabled={actualIsSubmitting || !content.trim()} className="px-3 py-1.5 text-sm bg-[#7A00B8] text-white rounded hover:bg-[#5f0090] disabled:opacity-60 font-nunito">
                            {actualIsSubmitting ? <RefreshCw className="animate-spin h-4 w-4 inline"/> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- End Helper Modals ---

interface CommentSectionProps {
    threadId: number;
    currentUserId: string | null;
}

interface CommentUIState extends ThreadCommentDto {
    showReplies: boolean;
    isLoadingReplies: boolean;
    isPostingReply: boolean; // For individual reply form
    replyError: string | null;
    replies: ThreadReplyDto[]; // Ensure replies are always part of the state for each comment
}

const CommentSection: React.FC<CommentSectionProps> = ({ threadId, currentUserId }) => {
    const { user, logout: triggerAuthContextLogout } = useAuth();
    const [comments, setComments] = useState<CommentUIState[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [errorComments, setErrorComments] = useState<string | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false); // For main comment form

    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [newReplyText, setNewReplyText] = useState('');

    // Edit/Delete states for comments and replies
    const [editingComment, setEditingComment] = useState<CommentUIState | null>(null);
    const [deletingComment, setDeletingComment] = useState<ThreadCommentDto | null>(null);
    const [editingReply, setEditingReply] = useState<ThreadReplyDto | null>(null);
    const [deletingReply, setDeletingReply] = useState<ThreadReplyDto | null>(null);
    const [parentCommentForReplyAction, setParentCommentForReplyAction] = useState<CommentUIState | null>(null); // To know which comment's replies to update


    const callApiWithRetry = useCallback(async <T,>(
        apiCall: () => Promise<T>,
        markAsRetried: boolean = false
    ): Promise<T | null> => {
        try { return await apiCall(); }
        catch (err: any) {
            if (forumApi.isAxiosError(err) && err.response?.status === 401 && !markAsRetried) {
                try {
                    console.log("CommentSection: API call 401, attempting token refresh...");
                    await attemptTokenRefresh();
                    console.log("CommentSection: Token refresh OK, retrying API call...");
                    return await callApiWithRetry(apiCall, true); 
                } catch (refreshError) {
                    console.error("CommentSection: Token refresh FAILED:", refreshError);
                    toast.error('Your session has expired. Please login again.');
                    if (triggerAuthContextLogout) triggerAuthContextLogout(); 
                    else window.dispatchEvent(new CustomEvent('auth:logout', { detail: { message: 'Session expired.' } }));
                    return null;
                }
            }
            const errorMessage = forumApi.isAxiosError(err) && err.response?.data?.message 
                ? err.response.data.message : err.message || 'An API error occurred.';
            throw new Error(errorMessage);
        }
    }, [triggerAuthContextLogout]);

    const fetchComments = useCallback(async () => {
        if (!threadId) return;
        setIsLoadingComments(true); setErrorComments(null);
        try {
            const fetchedData = await callApiWithRetry<ThreadCommentDto[] | null>(() => forumApi.getCommentsForThread(threadId));
            if (fetchedData) setComments(fetchedData.map(c => ({ ...c, showReplies: false, replies: [], isLoadingReplies: false, isPostingReply: false, replyError: null })));
        } catch (err: any) { setErrorComments(`Failed to load comments: ${err.message}`); toast.error(`Comments: ${err.message}`); } 
        finally { setIsLoadingComments(false); }
    }, [threadId, callApiWithRetry]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handlePostComment = async () => {
        if (!newCommentText.trim()) return toast.error("Comment cannot be empty.");
        setIsPostingComment(true);
        try {
            const newCommentData = await callApiWithRetry<ThreadCommentDto | null>(() => forumApi.createCommentOnThread(threadId, { content: newCommentText }));
            if (newCommentData) {
                setComments(prev => [{ ...newCommentData, showReplies: false, replies: [], isLoadingReplies: false, isPostingReply: false, replyError: null }, ...prev]);
                setNewCommentText(''); toast.success("Comment posted!");
            }
        } catch (err: any) { toast.error(`Post comment failed: ${err.message}`); } 
        finally { setIsPostingComment(false); }
    };
    
    const fetchRepliesForComment = async (commentId: number) => {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: true, replyError: null } : c));
        try {
            const fetchedData = await callApiWithRetry<ThreadReplyDto[] | null>(() => forumApi.getRepliesForComment(commentId));
            if (fetchedData) setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: fetchedData, isLoadingReplies: false } : c));
        } catch (err: any) {
            toast.error(`Load replies failed: ${err.message}`);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: false, replyError: err.message } : c));
        }
    };
    
    const toggleShowReplies = (commentId: number) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const willShow = !c.showReplies;
                if (willShow && c.repliesCount > 0 && c.replies.length === 0 && !c.isLoadingReplies) fetchRepliesForComment(commentId);
                return { ...c, showReplies: willShow, isLoadingReplies: (willShow && c.repliesCount > 0 && c.replies.length === 0 && !c.isLoadingReplies) ? true : c.isLoadingReplies };
            } return c;
        }));
    };

    const handlePostReply = async (commentId: number) => {
        if (!newReplyText.trim()) return toast.error("Reply cannot be empty.");
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isPostingReply: true } : c));
        try {
            const newReplyData = await callApiWithRetry<ThreadReplyDto | null>(() => forumApi.createReplyToComment(commentId, { content: newReplyText }));
            if (newReplyData) {
                setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, newReplyData], isPostingReply: false, repliesCount: (c.repliesCount || 0) + 1 } : c));
                setNewReplyText(''); setReplyingToCommentId(null); toast.success("Reply posted!");
            }
        } catch (err: any) { toast.error(`Post reply failed: ${err.message}`); } 
        finally { setComments(prev => prev.map(c => c.id === commentId ? { ...c, isPostingReply: false } : c));}
    };

    const formatRelativeTime = (dateStringISO?: string): string => {
        if (!dateStringISO) return 'a moment ago';
        try { return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true }); }
        catch { return dateStringISO; } 
    };

    // --- Edit/Delete Handlers for Comments ---
    const handleEditCommentSubmit = async (newContent: string) => {
        if (!editingComment) return;
        setIsPostingComment(true); // Use main comment posting indicator or add a specific one
        try {
            const updatedCommentData = await callApiWithRetry<ThreadCommentDto | null>(() => forumApi.updateComment(editingComment.id, { content: newContent }));
            if (updatedCommentData) {
                setComments(prev => prev.map(c => c.id === updatedCommentData.id ? { ...c, ...updatedCommentData, replies: c.replies, showReplies: c.showReplies } : c)); // Preserve replies UI state
                toast.success("Comment updated!");
            }
        } catch (err:any) { toast.error(`Update comment failed: ${err.message}`); }
        finally { setEditingComment(null); setIsPostingComment(false); }
    };
    const handleDeleteCommentConfirm = async () => {
        if (!deletingComment) return;
        setIsPostingComment(true);
        try {
            await callApiWithRetry<void | null>(() => forumApi.deleteComment(deletingComment.id));
            setComments(prev => prev.filter(c => c.id !== deletingComment.id));
            toast.success("Comment deleted!");
        } catch (err:any) { toast.error(`Delete comment failed: ${err.message}`); }
        finally { setDeletingComment(null); setIsPostingComment(false); }
    };

    // --- Edit/Delete Handlers for Replies ---
    const handleEditReplySubmit = async (newContent: string) => {
        if (!editingReply || !parentCommentForReplyAction) return;
        setComments(prev => prev.map(c => c.id === parentCommentForReplyAction.id ? {...c, isPostingReply : true } : c ));
        try {
            const updatedReplyData = await callApiWithRetry<ThreadReplyDto | null>(() => forumApi.updateReply(editingReply.id, { content: newContent }));
            if (updatedReplyData) {
                setComments(prev => prev.map(c => 
                    c.id === parentCommentForReplyAction.id 
                    ? { ...c, replies: c.replies.map(r => r.id === updatedReplyData.id ? updatedReplyData : r) } 
                    : c
                ));
                toast.success("Reply updated!");
            }
        } catch (err:any) { toast.error(`Update reply failed: ${err.message}`); }
        finally { setEditingReply(null); setParentCommentForReplyAction(null);  setComments(prev => prev.map(c => ({...c, isPostingReply: false })));}
    };
    const handleDeleteReplyConfirm = async () => {
        if (!deletingReply || !parentCommentForReplyAction) return;
        setComments(prev => prev.map(c => c.id === parentCommentForReplyAction.id ? {...c, isPostingReply : true } : c ));
        try {
            await callApiWithRetry<void | null>(() => forumApi.deleteReply(deletingReply.id));
             setComments(prev => prev.map(c => 
                c.id === parentCommentForReplyAction.id
                ? { ...c, replies: c.replies.filter(r => r.id !== deletingReply.id), repliesCount: Math.max(0, c.repliesCount - 1) } 
                : c
            ));
            toast.success("Reply deleted!");
        } catch (err:any) { toast.error(`Delete reply failed: ${err.message}`); }
        finally { setDeletingReply(null); setParentCommentForReplyAction(null); setComments(prev => prev.map(c => ({...c, isPostingReply: false }))); }
    };


    if (isLoadingComments) return <div className="flex justify-center items-center p-6 text-white/80"><RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading comments...</div>;
    if (errorComments) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"><AlertCircle className="inline h-4 w-4 mr-1"/> {errorComments} <button onClick={fetchComments} className="ml-2 text-red-800 underline font-medium">Retry</button></div>;
    
    return (
        <div className="space-y-5">
            {/* Add Comment Form */}
            {currentUserId && (
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center text-white font-bold shadow-md text-base" title={user?.name}>
                         {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover"/> : user?.name?.charAt(0)?.toUpperCase() || 'Me'}
                    </div>
                    <div className="flex-1">
                        <textarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Add a comment..." 
                                  className="w-full bg-[#FDF6FF]/70 border border-[#D0A0E6]/50 rounded-lg px-3 py-2 text-[#1B0A3F] focus:ring-1 focus:ring-[#BF4BF6] focus:border-transparent font-nunito text-sm sm:text-base min-h-[70px]" 
                                  disabled={isPostingComment} />
                        <button onClick={handlePostComment} disabled={isPostingComment || !newCommentText.trim()} className="mt-2 px-4 py-1.5 text-sm bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] font-nunito disabled:opacity-60 flex items-center justify-center w-full sm:w-auto min-w-[150px]">
                            {isPostingComment ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /><span className="ml-2">Post Comment</span></>}
                        </button>
                    </div>
                </div>
            )}

            {comments.length === 0 && !isLoadingComments && <p className="text-center text-sm text-white/50 font-nunito py-3">No comments yet. Be the first to share your thoughts!</p>}
            
            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-1.5 shadow">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#D68BF9] to-[#BF4BF6] flex items-center justify-center text-white font-semibold shadow text-xs sm:text-sm" title={comment.author?.name}>
                                {comment.author?.avatar ? <img src={comment.author.avatar} alt="" className="w-full h-full rounded-lg object-cover"/> : comment.author?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-medium text-sm sm:text-base text-[#2c0b5f]">{comment.author?.name || 'Anonymous'}</span>
                                        <span className="ml-2 text-[11px] sm:text-xs text-[#52007C]/80">{formatRelativeTime(comment.createdAt)}</span>
                                    </div>
                                    {comment.isCurrentUserAuthor && currentUserId === comment.author?.id && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => setEditingComment(comment)} title="Edit comment" className="p-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50" disabled={isPostingComment}><Edit2 size={14}/></button>
                                            <button onClick={() => setDeletingComment(comment)} title="Delete comment" className="p-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50" disabled={isPostingComment}><Trash2 size={14}/></button>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-[#4a0c75] whitespace-pre-wrap break-words">{comment.content}</p>
                                {currentUserId && (
                                    <button onClick={() => { setReplyingToCommentId(prev => prev === comment.id ? null : comment.id); setNewReplyText('');}} className="mt-1.5 text-xs sm:text-sm text-[#9030b7] hover:text-[#6a009d] font-semibold disabled:opacity-50" disabled={isPostingComment || comment.isPostingReply}>
                                        {replyingToCommentId === comment.id ? 'Cancel Reply' : 'Reply'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Reply Form */}
                        {replyingToCommentId === comment.id && currentUserId && (
                            <div className="ml-10 sm:ml-12 mt-2 pt-2 pl-2 sm:pl-3 border-l-2 border-[#D0A0E6]/70">
                                <textarea value={newReplyText} onChange={(e) => setNewReplyText(e.target.value)} placeholder={`Replying...`} 
                                          className="w-full bg-white/70 border border-[#CBB0DB]/60 rounded-md px-2.5 py-1.5 text-[#1B0A3F] focus:ring-1 focus:ring-[#BF4BF6] text-xs sm:text-sm min-h-[50px]" 
                                          disabled={comment.isPostingReply} />
                                <div className="mt-1.5 flex gap-2">
                                    <button onClick={() => handlePostReply(comment.id)} disabled={comment.isPostingReply || !newReplyText.trim()} className="px-3 py-1 text-xs sm:text-sm bg-gradient-to-r from-[#BF4BF6]/80 to-[#7A00B8]/80 text-white rounded hover:from-[#D68BF9]/80 hover:to-[#BF4BF6]/80 font-nunito disabled:opacity-60 flex items-center justify-center min-w-[80px]">
                                        {comment.isPostingReply ? <RefreshCw className="h-3 w-3 animate-spin" /> : <><Send className="h-3 w-3" /><span className="ml-1.5">Post</span></>}
                                    </button>
                                    <button onClick={() => setReplyingToCommentId(null)} className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-[#52007C] rounded hover:bg-gray-200 font-nunito">Cancel</button>
                                </div>
                            </div>
                        )}

                        {/* Replies Section */}
                        {comment.repliesCount > 0 && (
                             <button onClick={() => toggleShowReplies(comment.id)} className="text-xs font-semibold text-[#7A00B8] hover:underline mt-2 ml-10 sm:ml-12 flex items-center disabled:opacity-50" disabled={comment.isLoadingReplies || isPostingComment}>
                                <MessageCircle className={`h-3 w-3 mr-1 ${comment.showReplies ? 'fill-[#7A00B8]/70 text-white' : 'text-[#7A00B8]'}`} />
                                {comment.showReplies ? 'Hide' : `View ${comment.repliesCount}`} Reply{comment.repliesCount === 1 ? '' : 's'}
                                {comment.isLoadingReplies && <RefreshCw className="h-3 w-3 animate-spin inline ml-1.5" />}
                            </button>
                        )}
                        {comment.replyError && comment.showReplies && !comment.isLoadingReplies && (
                            <p className="ml-12 mt-1 text-xs text-red-600 bg-red-50 p-1.5 rounded ">Error: {comment.replyError} <span onClick={() => fetchRepliesForComment(comment.id)} className="underline cursor-pointer font-medium">Retry</span></p>
                        )}

                        {comment.showReplies && comment.replies.length > 0 && (
                            <div className="ml-10 sm:ml-12 mt-2 space-y-2 pt-1 pl-2 sm:pl-3 border-l-2 border-dashed border-[#D0A0E6]/50">
                                {comment.replies.map(reply => (
                                    <div key={reply.id} className="flex gap-2">
                                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#E0AAFF] to-[#C07EFF] flex items-center justify-center text-white font-semibold shadow-sm text-xs" title={reply.author?.name}>
                                             {reply.author?.avatar ? <img src={reply.author.avatar} alt="" className="w-full h-full rounded-lg object-cover"/> : reply.author?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-xs sm:text-sm text-[#2c0b5f]">{reply.author?.name || 'Anonymous'}</span>
                                                    <span className="text-[10px] sm:text-xs text-[#52007C]/70">{formatRelativeTime(reply.createdAt)}</span>
                                                </div>
                                                {reply.isCurrentUserAuthor && currentUserId === reply.author?.id && (
                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button onClick={() => { setParentCommentForReplyAction(comment); setEditingReply(reply); }} title="Edit reply" className="p-0.5 text-[10px] text-blue-600 hover:text-blue-800 disabled:opacity-50" disabled={comment.isPostingReply}><Edit2 size={12}/></button>
                                                        <button onClick={() => { setParentCommentForReplyAction(comment); setDeletingReply(reply);}} title="Delete reply" className="p-0.5 text-[10px] text-red-500 hover:text-red-700 disabled:opacity-50" disabled={comment.isPostingReply}><Trash2 size={12}/></button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-xs sm:text-sm text-[#4a0c75]/90 whitespace-pre-wrap break-words">{reply.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {comment.showReplies && comment.replies.length === 0 && !comment.isLoadingReplies && !comment.replyError && comment.repliesCount > 0 && (
                             <p className="ml-12 text-xs text-gray-500 italic mt-1">No replies loaded for this comment.</p>
                         )}
                    </div>
                ))}
            </div>

            {/* ---- Modals for Edit/Delete Actions ---- */}
            {editingComment && !editingReply && ( 
                 <EditItemModal 
                    isOpen={!!editingComment}
                    onClose={() => setEditingComment(null)}
                    initialContent={editingComment.content}
                    onSubmit={handleEditCommentSubmit}
                    title="Edit Comment"
                    isSubmitting={isPostingComment} // Pass submitting state
                 />
            )}
            {deletingComment && (
                <DeleteItemDialog 
                    isOpen={!!deletingComment}
                    onClose={() => setDeletingComment(null)}
                    onConfirm={handleDeleteCommentConfirm}
                    itemName="comment"
                    itemContentPreview={deletingComment.content}
                />
            )}
             {editingReply && parentCommentForReplyAction && ( 
                 <EditItemModal 
                    isOpen={!!editingReply}
                    onClose={() => { setEditingReply(null); setParentCommentForReplyAction(null); }}
                    initialContent={editingReply.content}
                    onSubmit={handleEditReplySubmit}
                    title="Edit Reply"
                    isSubmitting={parentCommentForReplyAction.isPostingReply}
                 />
            )}
            {deletingReply && parentCommentForReplyAction && (
                <DeleteItemDialog 
                    isOpen={!!deletingReply}
                    onClose={() => {setDeletingReply(null); setParentCommentForReplyAction(null);}}
                    onConfirm={handleDeleteReplyConfirm}
                    itemName="reply"
                    itemContentPreview={deletingReply.content}
                />
            )}
        </div>
    );
};

export default CommentSection;