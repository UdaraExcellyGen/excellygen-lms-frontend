// src/features/Learner/DiscussionForum/components/CommentSection.tsx

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- ADDED IMPORT
import { RefreshCw, Send, MessageCircle, AlertCircle, Edit2, Trash2, Code2 } from 'lucide-react';
import * as forumApi from '../../../../api/forumApi';
import { ThreadCommentDto, ThreadReplyDto } from '../types/dto';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import MarkdownRenderer from '../../../../components/common/MarkdownRenderer';
import TiptapEditor from './TiptapEditor';

// Helper Modal Components (unchanged)
interface EditItemModalProps {
    isOpen: boolean; 
    onClose: () => void; 
    initialContent: string;
    onSubmit: (newContent: string) => Promise<void>; 
    title: string; 
    isSubmitting?: boolean;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, onClose, initialContent, onSubmit, title, isSubmitting: parentIsSubmitting = false }) => {
    const [content, setContent] = useState(initialContent);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) { setContent(initialContent); setIsProcessing(false); }
    }, [initialContent, isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.replace(/<(.|\n)*?>/g, '').trim().length === 0) { 
            toast.error("Content cannot be empty."); 
            return; 
        }
        setIsProcessing(true);
        try { await onSubmit(content); } 
        catch (err) { console.error(`${title} submission error caught in modal:`, err); } 
        finally { setIsProcessing(false); }
    };

    if (!isOpen) return null;
    const actualIsSubmitting = parentIsSubmitting || isProcessing;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-[#1B0A3F]">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <TiptapEditor
                        content={content}
                        onChange={setContent}
                        disabled={actualIsSubmitting}
                        minHeight="150px"
                        maxHeight="300px"
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} disabled={actualIsSubmitting} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-nunito">Cancel</button>
                        <button type="submit" disabled={actualIsSubmitting || !content.trim() || content.replace(/<(.|\n)*?>/g, '').trim().length === 0} className="px-3 py-1.5 text-sm bg-[#7A00B8] text-white rounded hover:bg-[#5f0090] disabled:opacity-60 font-nunito">{actualIsSubmitting ? <RefreshCw className="animate-spin h-4 w-4 inline"/> : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DeleteItemDialogProps {
    isOpen: boolean; onClose: () => void; onConfirm: () => Promise<void>; 
    itemName: string; itemContentPreview?: string; customMessage?: string;
}

const DeleteItemDialog: React.FC<DeleteItemDialogProps> = ({ isOpen, onClose, onConfirm, itemName, itemContentPreview, customMessage }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleConfirmClick = async () => {
        setIsDeleting(true);
        try { await onConfirm(); } 
        catch (error) { console.error(`DeleteItemDialog: onConfirm failed for ${itemName}`, error); } 
        finally { setIsDeleting(false); }
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#1B0A3F]/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-xl border border-red-400/50 p-6 shadow-xl">
                <div className="flex items-center mb-3">
                    <AlertCircle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
                    <h3 className="text-xl font-unbounded text-red-700">Delete {itemName}</h3>
                </div>
                <p className="text-[#52007C] font-nunito text-sm mb-1">{customMessage || `Are you sure you want to permanently delete this ${itemName}?`}</p>
                {itemContentPreview && (<p className="text-xs text-gray-500 bg-gray-100 p-2 rounded border max-h-20 overflow-y-auto mb-4">"{itemContentPreview.substring(0, 100)}{itemContentPreview.length > 100 ? '...' : ''}"</p>)}
                <p className="text-xs text-red-600 font-semibold mb-6">This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-nunito">Cancel</button>
                    <button onClick={handleConfirmClick} disabled={isDeleting} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-nunito disabled:opacity-70">{isDeleting ? <RefreshCw className="animate-spin h-5 w-5 inline" /> : `Yes, Delete ${itemName}`}</button>
                </div>
            </div>
        </div>
    );
};

interface CommentSectionProps {
    threadId: number; currentUserId: string | null; onCommentPosted: () => void;
}

interface CommentUIState extends ThreadCommentDto {
    showReplies: boolean; isLoadingReplies: boolean; isPostingReply: boolean; replyError: string | null; replies: ThreadReplyDto[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ threadId, currentUserId, onCommentPosted }) => {
    const navigate = useNavigate(); // <-- ADDED HOOK
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentUIState[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [errorComments, setErrorComments] = useState<string | null>(null);
    
    const [newCommentContent, setNewCommentContent] = useState('');
    const [isMainCommentRichEditor, setIsMainCommentRichEditor] = useState(false);

    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);
    const [replyContents, setReplyContents] = useState<Record<number, string>>({});
    const [isReplyRichEditor, setIsReplyRichEditor] = useState<Record<number, boolean>>({});

    const [isPostingComment, setIsPostingComment] = useState(false); 
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [editingComment, setEditingComment] = useState<CommentUIState | null>(null);
    const [deletingComment, setDeletingComment] = useState<ThreadCommentDto | null>(null);
    const [editingReply, setEditingReply] = useState<ThreadReplyDto | null>(null);
    const [deletingReply, setDeletingReply] = useState<ThreadReplyDto | null>(null);
    const [parentCommentForReplyAction, setParentCommentForReplyAction] = useState<CommentUIState | null>(null);

    const fetchComments = useCallback(async () => {
        if (!threadId) return;
        setIsLoadingComments(true); setErrorComments(null);
        try {
            const fetchedData = await forumApi.getComments(threadId);
            setComments(fetchedData.map(c => ({ ...c, showReplies: false, replies: [], isLoadingReplies: false, isPostingReply: false, replyError: null })));
        } catch (err: any) { 
            const msg = forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message || "Could not load comments.";
            setErrorComments(msg); toast.error(`Comments: ${msg}`); 
        } finally { setIsLoadingComments(false); }
    }, [threadId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handlePostComment = async () => { 
        if (!newCommentContent.trim() || newCommentContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
            return toast.error("Comment cannot be empty."); 
        }
        setIsPostingComment(true);
        try {
            const newCommentData = await forumApi.createComment(threadId, { content: newCommentContent });
            setComments(prev => [{ 
                ...newCommentData, 
                showReplies: false, 
                replies: [], 
                isLoadingReplies: false, 
                isPostingReply: false, 
                replyError: null 
            }, ...prev]);
            setNewCommentContent(''); 
            setIsMainCommentRichEditor(false);
            toast.success("Comment posted!");
            onCommentPosted();
        } catch (err: any) { 
            toast.error(`Post comment failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`); 
        } finally { 
            setIsPostingComment(false); 
        }
    };
    
    const fetchRepliesForComment = async (commentId: number) => { 
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: true, replyError: null } : c));
        try {
            const fetchedData = await forumApi.getReplies(commentId);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: fetchedData, isLoadingReplies: false } : c));
        } catch (err: any) {
            toast.error(`Load replies failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, isLoadingReplies: false, replyError: err.message } : c));
        }
    };
    
    const toggleShowReplies = (commentId: number) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const willShow = !c.showReplies;
                if (willShow && c.repliesCount > 0 && c.replies.length === 0 && !c.isLoadingReplies) { fetchRepliesForComment(commentId); }
                return { ...c, showReplies: willShow, isLoadingReplies: (willShow && c.repliesCount > 0 && c.replies.length === 0 && !c.isLoadingReplies) ? true : c.isLoadingReplies };
            } 
            return c;
        }));
    };

    const handlePostReply = async (commentId: number) => { 
        const replyContent = replyContents[commentId] || '';
        if (!replyContent.trim() || replyContent.replace(/<(.|\n)*?>/g, '').trim().length === 0) { 
            return toast.error("Reply cannot be empty."); 
        }
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, isPostingReply: true } : c));
        try {
            const newReplyData = await forumApi.createReply(commentId, { content: replyContent });
            setComments(prev => prev.map(c => c.id === commentId ? { 
                ...c, 
                replies: [...c.replies, newReplyData], 
                isPostingReply: false, 
                repliesCount: (c.repliesCount || 0) + 1 
            } : c));
            setReplyContents(prev => { const newMap = { ...prev }; delete newMap[commentId]; return newMap; });
            setIsReplyRichEditor(prev => { const newMap = { ...prev }; delete newMap[commentId]; return newMap; });
            setReplyingToCommentId(null); 
            toast.success("Reply posted!");
            onCommentPosted();
        } catch (err: any) { 
            toast.error(`Post reply failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`);
        } finally { 
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, isPostingReply: false } : c));
        }
    };

    const handleEditCommentSubmit = async (newContent: string) => { 
        if (!editingComment) return; 
        setIsActionLoading(true);
        try { 
            const updatedCommentData = await forumApi.updateComment(editingComment.id, { content: newContent });
            setComments(prev => prev.map(c => c.id === updatedCommentData.id ? { 
                ...c, 
                ...updatedCommentData, 
                replies: c.replies, 
                showReplies: c.showReplies 
            } : c));
            toast.success("Comment updated!"); setEditingComment(null);
        } catch (err: any) { toast.error(`Update comment failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`); } 
        finally { setIsActionLoading(false); }
    };
    
    const handleDeleteCommentConfirm = async () => { 
        if (!deletingComment) return; 
        setIsActionLoading(true);
        try { 
            await forumApi.deleteComment(deletingComment.id);
            setComments(prev => prev.filter(c => c.id !== deletingComment.id));
            toast.success("Comment deleted!"); setDeletingComment(null);
        } catch (err: any) { toast.error(`Delete comment failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`); } 
        finally { setIsActionLoading(false); }
    };
    
    const handleEditReplySubmit = async (newContent: string) => { 
        if (!editingReply || !parentCommentForReplyAction) return; 
        setIsActionLoading(true);
        try { 
            const updatedReplyData = await forumApi.updateReply(editingReply.id, { content: newContent });
            setComments(prev => prev.map(c => c.id === parentCommentForReplyAction.id ? { 
                ...c, 
                replies: c.replies.map(r => r.id === updatedReplyData.id ? updatedReplyData : r) 
            } : c));
            toast.success("Reply updated!"); setEditingReply(null); setParentCommentForReplyAction(null);
        } catch (err: any) { toast.error(`Update reply failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`); } 
        finally { setIsActionLoading(false); }
    };

    const handleDeleteReplyConfirm = async () => { 
        if (!deletingReply || !parentCommentForReplyAction) return; 
        setIsActionLoading(true);
        try { 
            await forumApi.deleteReply(deletingReply.id);
            setComments(prev => prev.map(c => c.id === parentCommentForReplyAction.id ? { 
                ...c, 
                replies: c.replies.filter(r => r.id !== deletingReply.id), 
                repliesCount: Math.max(0, c.repliesCount - 1) 
            } : c));
            toast.success("Reply deleted!"); setDeletingReply(null); setParentCommentForReplyAction(null);
        } catch (err: any) { toast.error(`Delete reply failed: ${forumApi.isAxiosError(err) ? (err.response?.data as { message?: string })?.message || err.message : err.message}`); } 
        finally { setIsActionLoading(false); }
    };

    const formatRelativeTime = (dateStringISO?: string): string => { 
        if (!dateStringISO) return 'a moment ago';
        try { return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true }); } 
        catch { return "just now"; }
    };
    
    if (isLoadingComments) return <div className="flex justify-center items-center p-6 text-white/80"><RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading comments...</div>;
    if (errorComments) return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"><AlertCircle className="inline h-4 w-4 mr-1"/> {errorComments} <button onClick={fetchComments} className="ml-2 text-red-800 underline font-medium">Retry</button></div>;
    
    return (
        <div className="space-y-5">
            {/* Add Comment Form */}
            {currentUserId && (
                <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center text-white font-bold shadow-md text-base" title={user?.name}>
                         {user?.avatar ? (
                            <img src={user.avatar} alt={user.name || ''} className="w-full h-full rounded-xl object-cover"/>
                         ) : (
                            user?.name?.charAt(0)?.toUpperCase() || 'Me'
                         )}
                    </div>
                    <div className="flex-1">
                        {!isMainCommentRichEditor ? (
                            <div className="relative">
                                <textarea 
                                    value={newCommentContent} 
                                    onChange={(e) => setNewCommentContent(e.target.value)} 
                                    placeholder="Add a comment..." 
                                    className="w-full bg-[#FDF6FF]/70 border border-[#D0A0E6]/50 rounded-lg px-3 py-2 text-[#1B0A3F] focus:ring-1 focus:ring-[#BF4BF6] focus:border-transparent font-nunito text-sm sm:text-base min-h-[70px] pr-10"
                                    disabled={isPostingComment || isActionLoading} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsMainCommentRichEditor(true)}
                                    disabled={isPostingComment || isActionLoading}
                                    className="absolute right-2 top-2 p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100/50 rounded-md disabled:opacity-50"
                                    title="Switch to rich text editor"
                                >
                                    <Code2 size={18} />
                                </button>
                            </div>
                        ) : (
                            <TiptapEditor
                                content={newCommentContent}
                                onChange={setNewCommentContent}
                                disabled={isPostingComment || isActionLoading}
                                minHeight="100px"
                                maxHeight="250px"
                            />
                        )}
                        <button 
                            onClick={handlePostComment} 
                            disabled={isPostingComment || isActionLoading || (!newCommentContent.trim() && !isMainCommentRichEditor) || (isMainCommentRichEditor && newCommentContent.replace(/<(.|\n)*?>/g, '').trim().length === 0)} 
                            className="mt-2 px-4 py-1.5 text-sm bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-lg hover:from-[#D68BF9] hover:to-[#BF4BF6] font-nunito disabled:opacity-60 flex items-center justify-center w-full sm:w-auto min-w-[150px]"
                        >
                            {isPostingComment ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span className="ml-2">Post Comment</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {!currentUserId && (
                <p className="text-center text-sm text-white/70 font-nunito py-3 italic">
                    You must be logged in to comment.
                </p>
            )}

            {comments.length === 0 && !isLoadingComments && (
                <p className="text-center text-sm text-white/50 font-nunito py-3">
                    No comments yet.
                </p>
            )}
            
            {/* Comments List */}
            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 space-y-1.5 shadow-sm relative">
                        {((editingComment?.id === comment.id || deletingComment?.id === comment.id || parentCommentForReplyAction?.id === comment.id) && isActionLoading) && (
                            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                                <RefreshCw className="h-5 w-5 animate-spin text-[#7A00B8]"/>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#D68BF9] to-[#BF4BF6] flex items-center justify-center text-white font-semibold shadow text-xs sm:text-sm" title={comment.author?.name}>
                                {comment.author?.avatar ? (
                                    <img src={comment.author.avatar} alt="" className="w-full h-full rounded-lg object-cover"/>
                                ) : (
                                    comment.author?.name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        {/* --- THIS IS THE FIX FOR COMMENTS --- */}
                                        <button
                                            onClick={() => {
                                                if (comment.author?.id) {
                                                    navigate(`/learner/profile/${comment.author.id}`);
                                                }
                                            }}
                                            disabled={!comment.author?.id}
                                            className="font-medium text-sm sm:text-base text-[#2c0b5f] hover:underline disabled:no-underline disabled:cursor-default"
                                            title={comment.author?.id ? `View profile of ${comment.author.name}` : 'Anonymous user'}
                                        >
                                            {comment.author?.name || 'Anonymous'}
                                        </button>
                                        <span className="ml-2 text-[11px] sm:text-xs text-[#52007C]/80">
                                            {formatRelativeTime(comment.createdAt)}
                                        </span>
                                    </div>
                                    {comment.isCurrentUserAuthor && currentUserId === comment.author?.id && (
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button 
                                                onClick={() => setEditingComment(comment)} 
                                                title="Edit comment" 
                                                className="p-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50" 
                                                disabled={isActionLoading}
                                            >
                                                <Edit2 size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => setDeletingComment(comment)} 
                                                title="Delete comment" 
                                                className="p-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50" 
                                                disabled={isActionLoading}
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <MarkdownRenderer content={comment.content} className="prose prose-sm max-w-none mt-1 text-[#4a0c75] break-words" />
                                
                                {currentUserId && (
                                    <button 
                                        onClick={() => { 
                                            setReplyingToCommentId(prev => prev === comment.id ? null : comment.id); 
                                            setReplyContents(prev => ({ ...prev, [comment.id]: '' }));
                                            setIsReplyRichEditor(prev => ({ ...prev, [comment.id]: false }));
                                        }} 
                                        className="mt-1.5 text-xs sm:text-sm text-[#9030b7] hover:text-[#6a009d] font-semibold disabled:opacity-50" 
                                        disabled={isActionLoading || comment.isPostingReply}
                                    >
                                        {replyingToCommentId === comment.id ? 'Cancel' : 'Reply'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Reply Form */}
                        {replyingToCommentId === comment.id && currentUserId && (
                            <div className="ml-10 sm:ml-12 mt-2 pt-2 pl-2 sm:pl-3 border-l-2 border-[#D0A0E6]/70">
                                {!isReplyRichEditor[comment.id] ? (
                                    <div className="relative">
                                        <textarea 
                                            value={replyContents[comment.id] || ''} 
                                            onChange={(e) => setReplyContents(prev => ({ ...prev, [comment.id]: e.target.value }))} 
                                            placeholder="Write a reply..." 
                                            className="w-full bg-white/70 border border-[#CBB0DB]/60 rounded-md px-2.5 py-1.5 text-[#1B0A3F] focus:ring-1 focus:ring-[#BF4BF6] text-xs sm:text-sm min-h-[50px] pr-10"
                                            disabled={comment.isPostingReply || isActionLoading} 
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsReplyRichEditor(prev => ({ ...prev, [comment.id]: true }))}
                                            disabled={comment.isPostingReply || isActionLoading}
                                            className="absolute right-2 top-1.5 p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100/50 rounded-md disabled:opacity-50"
                                            title="Switch to rich text editor"
                                        >
                                            <Code2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <TiptapEditor
                                        content={replyContents[comment.id] || ''}
                                        onChange={(newContent) => setReplyContents(prev => ({ ...prev, [comment.id]: newContent }))}
                                        disabled={comment.isPostingReply || isActionLoading}
                                        minHeight="80px"
                                        maxHeight="200px"
                                    />
                                )}
                                <div className="mt-1.5 flex gap-2">
                                    <button 
                                        onClick={() => handlePostReply(comment.id)} 
                                        disabled={comment.isPostingReply || isActionLoading || (!replyContents[comment.id]?.trim() && !isReplyRichEditor[comment.id]) || (isReplyRichEditor[comment.id] && (replyContents[comment.id] || '').replace(/<(.|\n)*?>/g, '').trim().length === 0)} 
                                        className="px-3 py-1 text-xs sm:text-sm bg-gradient-to-r from-[#BF4BF6]/80 to-[#7A00B8]/80 text-white rounded hover:from-[#D68BF9]/80 hover:to-[#BF4BF6]/80 font-nunito disabled:opacity-60 flex items-center justify-center min-w-[80px]"
                                    >
                                        {comment.isPostingReply ? (
                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="h-3 w-3" />
                                                <span className="ml-1.5">Post</span>
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setReplyingToCommentId(null);
                                            setReplyContents(prev => { const newMap = { ...prev }; delete newMap[comment.id]; return newMap; });
                                            setIsReplyRichEditor(prev => { const newMap = { ...prev }; delete newMap[comment.id]; return newMap; });
                                        }} 
                                        disabled={comment.isPostingReply || isActionLoading} 
                                        className="px-3 py-1 text-xs sm:text-sm bg-gray-100 text-[#52007C] rounded hover:bg-gray-200 font-nunito"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Replies Section */}
                        {comment.repliesCount > 0 && (
                            <button 
                                onClick={() => toggleShowReplies(comment.id)} 
                                className="text-xs font-semibold text-[#6a009d] hover:underline mt-2 ml-10 sm:ml-12 flex items-center disabled:opacity-50" 
                                disabled={comment.isLoadingReplies || isActionLoading}
                            >
                                <MessageCircle className={`h-3 w-3 mr-1 ${comment.showReplies ? 'fill-[#7A00B8]/70 text-white' : 'text-[#7A00B8]'}`} />
                                {comment.showReplies ? 'Hide' : `View ${comment.repliesCount}`} Reply{comment.repliesCount === 1 ? '' : 'ies'}
                                {comment.isLoadingReplies && <RefreshCw className="h-3 w-3 animate-spin inline ml-1.5" />}
                            </button>
                        )}
                        
                        {comment.replyError && comment.showReplies && !comment.isLoadingReplies && (
                            <p className="ml-12 mt-1 text-xs text-red-600 bg-red-50 p-1.5 rounded ">
                                Error: {comment.replyError} 
                                <span onClick={() => fetchRepliesForComment(comment.id)} className="underline cursor-pointer font-medium">
                                    Retry
                                </span>
                            </p>
                        )}
                        
                        {comment.showReplies && comment.replies.length > 0 && (
                            <div className="ml-10 sm:ml-12 mt-2 space-y-2 pt-1 pl-2 sm:pl-3 border-l-2 border-dashed border-[#D0A0E6]/50">
                                {comment.replies.map(reply => (
                                    <div key={reply.id} className="flex gap-2">
                                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#E0AAFF] to-[#C07EFF] flex items-center justify-center text-white font-semibold shadow-sm text-xs" title={reply.author?.name}>
                                             {reply.author?.avatar ? (
                                                <img src={reply.author.avatar} alt="" className="w-full h-full rounded-lg object-cover"/>
                                             ) : (
                                                reply.author?.name?.charAt(0).toUpperCase() || '?'
                                             )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    {/* --- THIS IS THE FIX FOR REPLIES --- */}
                                                    <button
                                                        onClick={() => {
                                                            if (reply.author?.id) {
                                                                navigate(`/learner/profile/${reply.author.id}`);
                                                            }
                                                        }}
                                                        disabled={!reply.author?.id}
                                                        className="font-medium text-xs sm:text-sm text-[#2c0b5f] hover:underline disabled:no-underline disabled:cursor-default"
                                                        title={reply.author?.id ? `View profile of ${reply.author.name}` : 'Anonymous user'}
                                                    >
                                                        {reply.author?.name || 'Anonymous'}
                                                    </button>
                                                    <span className="text-[10px] sm:text-xs text-[#52007C]/70">
                                                        {formatRelativeTime(reply.createdAt)}
                                                    </span>
                                                </div>
                                                {reply.isCurrentUserAuthor && currentUserId === reply.author?.id && (
                                                    <div className="flex items-center gap-0.5 flex-shrink-0">
                                                        <button 
                                                            onClick={() => { 
                                                                setParentCommentForReplyAction(comment); 
                                                                setEditingReply(reply);
                                                            }} 
                                                            title="Edit reply" 
                                                            className="p-0.5 text-[10px] text-blue-600 hover:text-blue-800 disabled:opacity-50" 
                                                            disabled={isActionLoading || comment.isPostingReply}
                                                        >
                                                            <Edit2 size={12}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => { 
                                                                setParentCommentForReplyAction(comment); 
                                                                setDeletingReply(reply);
                                                            }} 
                                                            title="Delete reply" 
                                                            className="p-0.5 text-[10px] text-red-500 hover:text-red-700 disabled:opacity-50" 
                                                            disabled={isActionLoading || comment.isPostingReply}
                                                        >
                                                            <Trash2 size={12}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <MarkdownRenderer content={reply.content} className="prose prose-xs max-w-none mt-0.5 text-[#4a0c75]/90 break-words" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {comment.showReplies && comment.replies.length === 0 && !comment.isLoadingReplies && !comment.replyError && comment.repliesCount > 0 && (
                            <p className="ml-12 text-xs text-gray-500 italic mt-1">
                                No replies to show.
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Modals */}
            {editingComment && !editingReply && ( 
                 <EditItemModal 
                    isOpen={!!editingComment}
                    onClose={() => setEditingComment(null)}
                    initialContent={editingComment.content}
                    onSubmit={handleEditCommentSubmit}
                    title="Edit Comment"
                    isSubmitting={isActionLoading} 
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
                    onClose={() => { 
                        setEditingReply(null); 
                        setParentCommentForReplyAction(null); 
                    }}
                    initialContent={editingReply.content}
                    onSubmit={handleEditReplySubmit}
                    title="Edit Reply"
                    isSubmitting={isActionLoading}
                 />
            )}
            
            {deletingReply && parentCommentForReplyAction && (
                <DeleteItemDialog 
                    isOpen={!!deletingReply}
                    onClose={() => {
                        setDeletingReply(null); 
                        setParentCommentForReplyAction(null);
                    }}
                    onConfirm={handleDeleteReplyConfirm}
                    itemName="reply"
                    itemContentPreview={deletingReply.content}
                />
            )}
        </div>
    );
};

export default CommentSection;