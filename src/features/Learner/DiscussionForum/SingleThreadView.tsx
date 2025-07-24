// src/pages/DiscussionForum/SingleThreadView.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, MessageSquare, ArrowLeft, RefreshCw, AlertCircle, Bookmark, Edit2, Trash2 } from 'lucide-react';

import Layout from '../../../components/Sidebar/Layout';
import CommentSection from './components/CommentSection';
import EditThreadModal from './components/EditThreadModal';
import DeleteItemDialog from './components/DeleteItemDialog';

import * as forumApi from '../../../api/forumApi';
import { ForumThreadDto, ThreadFormData, UpdateForumThreadDto } from './types/dto';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getAllCategories as fetchAllCourseCategoriesFromAdminApi } from '../../../features/Admin/ManageCourseCategory/data/api';
import { Category as AdminCourseCategoryType } from '../../../features/Admin/ManageCourseCategory/types/category.types';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';

const getErrorMessage = (err: any, defaultMessage: string): string => {
    if (forumApi.isAxiosError(err)) {
        const backendMessage = err.response?.data as { message?: string };
        return backendMessage?.message || err.message || defaultMessage;
    } else if (err instanceof Error) {
        return err.message || defaultMessage;
    }
    return defaultMessage;
};

const formatRelativeTime = (dateStringISO?: string): string => {
    if (!dateStringISO) return 'just now';
    try {
        return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true });
    } catch {
        return dateStringISO;
    }
};

const SingleThreadView: React.FC = () => {
    const { threadId } = useParams<{ threadId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [thread, setThread] = useState<ForumThreadDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [courseCategories, setCourseCategories] = useState<AdminCourseCategoryType[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        const loadCategories = async () => { 
            setIsLoadingCategories(true);
            try { 
                const categoriesData = await fetchAllCourseCategoriesFromAdminApi(); 
                setCourseCategories(categoriesData.filter(cat => cat.status === 'active')); 
            } catch (err: any) { 
                const msg = getErrorMessage(err, "Could not load categories for editing.");
                toast.error(`Categories Error: ${msg}`); 
            } finally { 
                setIsLoadingCategories(false); 
            }
        };
        loadCategories();
    }, []);

    const fetchThread = useCallback(async () => {
        if (!threadId) {
            setError("Thread ID is missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const threadData = await forumApi.getThread(threadId);
            setThread(threadData);
        } catch (err) {
            const errorMessageText = getErrorMessage(err, 'Could not load the thread.');
            setError(errorMessageText);
            toast.error(`Error: ${errorMessageText}`);
        } finally {
            setIsLoading(false);
        }
    }, [threadId]);

    useEffect(() => {
        fetchThread();
    }, [fetchThread]);

    const handleUpdateThread = async (formDataFromModal: ThreadFormData) => {
        if (!thread) return;
        setIsActionLoading(true);
        try {
            const updateDto: UpdateForumThreadDto = {
                title: formDataFromModal.title,
                content: formDataFromModal.content,
                category: formDataFromModal.category,
                imageUrl: formDataFromModal.imageUrl,
                removeCurrentImage: !formDataFromModal.imageUrl && !!thread.imageUrl
            };
            const updatedThread = await forumApi.updateThread(thread.id, updateDto);
            setThread(updatedThread);
            toast.success('Thread updated successfully!');
            setIsEditModalOpen(false);
        } catch (err: any) {
            toast.error(`Update failed: ${getErrorMessage(err, 'An unknown error occurred.')}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!thread) return;
        setIsActionLoading(true);
        try {
            await forumApi.deleteThread(thread.id);
            toast.success('Thread deleted successfully!');
            setIsDeleteDialogOpen(false);
            navigate('/learner/forum');
        } catch (err: any) {
            toast.error(`Delete failed: ${getErrorMessage(err, 'An unknown error occurred.')}`);
            setIsActionLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleCommentPosted = () => {
        setThread(t => t ? {...t, commentsCount: t.commentsCount + 1} : null);
    };

    const editModalInitialData: ThreadFormData | undefined = thread ? {
        title: thread.title,
        content: thread.content,
        category: thread.category,
        image: null,
        imagePreview: thread.imageUrl ?? undefined,
        imageUrl: thread.imageUrl ?? undefined,
        currentRelativePath: thread.imageUrl && thread.imageUrl.includes("/uploads/")
            ? thread.imageUrl.substring(thread.imageUrl.indexOf("/uploads/"))
            : undefined
    } : undefined;
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center p-20 text-white">
                    <RefreshCw className="h-10 w-10 animate-spin mr-4" />
                    <span className="text-xl">Loading thread...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                    <AlertCircle className="inline h-6 w-6 mr-2 align-text-bottom"/>
                    <strong className="font-bold mr-1">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                    <button 
                        onClick={fetchThread} 
                        className="ml-4 mt-2 sm:mt-0 px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-nunito"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        if (!thread) {
            return (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-300/30 p-8 text-center mt-4">
                    <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-purple-800 mb-2 font-unbounded">
                        Thread Not Found
                    </h3>
                    <p className="text-purple-700/80 font-nunito">
                        The thread you are looking for does not exist or has been deleted.
                    </p>
                </div>
            );
        }

        return (
            <div className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-300/40 shadow-lg overflow-hidden transition-opacity ${isActionLoading ? 'opacity-70' : ''}`}>
                <div className="p-5 sm:p-8">
                    {/* Header: Title, Author, etc. */}
                    <div className="pb-5 border-b border-purple-200/50">
                        <div className="flex justify-between items-start gap-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-full inline-flex items-center gap-2">
                                <Bookmark size={14} />
                                {thread.category}
                            </span>
                            {thread.isCurrentUserAuthor && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button 
                                        title="Edit Thread" 
                                        disabled={isActionLoading || isLoadingCategories} 
                                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100/50 rounded-md disabled:opacity-50" 
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        title="Delete Thread" 
                                        disabled={isActionLoading} 
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100/50 rounded-md disabled:opacity-50" 
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mt-4 font-unbounded break-words">
                            {thread.title}
                        </h1>
                        {/* --- THIS IS THE CORRECTED SECTION --- */}
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                            {/* Left side: Author */}
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow" title={thread.author?.name ?? 'User'}>
                                    {thread.author?.avatar ? (
                                        <img src={thread.author.avatar} alt={thread.author.name ?? ''} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        thread.author?.name?.charAt(0)?.toUpperCase() ?? 'A'
                                    )}
                                </div>
                                <span className="font-semibold text-purple-800 ml-2">
                                    {thread.author?.name ?? 'Anonymous'}
                                </span>
                            </div>
                            {/* Right side: Timestamp */}
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                                <span title={thread.createdAt}>{formatRelativeTime(thread.createdAt)}</span>
                                {thread.updatedAt && new Date(parseISO(thread.updatedAt)).getTime() > new Date(parseISO(thread.createdAt)).getTime() + (60 * 1000) && (
                                    <span className="ml-3 italic text-gray-500 text-xs sm:text-sm">
                                        (edited)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <MarkdownRenderer 
                        content={thread.content}
                        className="prose prose-purple max-w-none mt-6 text-gray-800 font-nunito text-base leading-relaxed break-words"
                    />

                    {thread.imageUrl && (
                        <div className="mt-8 flex justify-center">
                            <img 
                                src={thread.imageUrl} 
                                alt="Thread attachment" 
                                className="w-full max-w-xl max-h-[500px] rounded-lg object-contain border bg-gray-100 shadow-md"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="bg-purple-50/20 p-5 sm:p-8 border-t border-purple-200/50">
                    <h2 className="text-xl font-bold text-purple-900 mb-4 font-unbounded flex items-center">
                        <MessageSquare className="mr-3 text-purple-600"/>
                        Comments ({thread.commentsCount})
                    </h2>
                     <CommentSection 
                        threadId={thread.id} 
                        currentUserId={user?.id ?? null}
                        onCommentPosted={handleCommentPosted}
                     />
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] py-6">
                <div className="w-full px-8 sm:px-12 lg:px-20 xl:px-12.01 space-y-6">
                    <Link 
                        to="/learner/forum" 
                        className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold font-nunito transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        Back to Discussion Forum
                    </Link>
                    {renderContent()}
                </div>
            </div>

            {/* Modals for Edit and Delete */}
            {editModalInitialData && thread && (
                <EditThreadModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdateThread}
                    initialData={editModalInitialData}
                    availableCategories={courseCategories.map(cat => cat.title)}
                />
            )}

            {thread && (
                <DeleteItemDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    itemName="thread"
                    itemContentPreview={thread.title}
                />
            )}
        </Layout>
    );
};

export default SingleThreadView;