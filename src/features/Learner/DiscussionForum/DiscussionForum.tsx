// src/pages/DiscussionForum/DiscussionForum.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    MessageSquare, Search, Plus, Clock, MessageCircle, Edit2, Trash2, Eye, 
    RefreshCw, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import CreateThreadModal from './components/CreateThreadModal';
import EditThreadModal from './components/EditThreadModal';
import DeleteItemDialog from './components/DeleteItemDialog'; // Changed from DeleteConfirmationDialog
import MyThreadsButton from './components/MyThreadsButton';
import CommentSection from './components/CommentSection';
import * as forumApi from '../../../api/forumApi';
import { refreshToken as attemptTokenRefresh } from '../../../api/authApi';
import { 
    ThreadFormData, ForumThreadDto, ForumQueryParams, PagedResult, 
    CreateForumThreadDto, UpdateForumThreadDto 
} from './types/dto'; // Assuming dto.ts is in ./types/ relative to DiscussionForum.tsx
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';

const DEFAULT_PAGE_SIZE = 10;

const DiscussionForum: React.FC = () => {
    const { user, logout: triggerAuthContextLogout } = useAuth();
    const [threads, setThreads] = useState<ForumThreadDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false); // For specific CUD actions
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<ForumThreadDto | null>(null);
    const [threadToEdit, setThreadToEdit] = useState<ForumThreadDto | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showMyThreads, setShowMyThreads] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalThreads, setTotalThreads] = useState(0);

    const categories = [ 'Software Engineering', 'Quality Assurance', 'Project Management', 'DevOps', 'UI/UX Design', 'Data Science', 'Cloud Computing', 'Cyber Security' ];

    const callApiWithRetry = useCallback(async <T,>(
        apiCall: () => Promise<T>,
        markAsRetried: boolean = false
    ): Promise<T | null> => {
        try { return await apiCall(); }
        catch (err: any) {
            if (forumApi.isAxiosError(err) && err.response?.status === 401 && !markAsRetried) {
                try {
                    console.log("DiscussionForum: API call 401, attempting token refresh...");
                    await attemptTokenRefresh();
                    console.log("DiscussionForum: Token refresh OK, retrying API call...");
                    return await callApiWithRetry(apiCall, true); 
                } catch (refreshError) {
                    console.error("DiscussionForum: Token refresh FAILED:", refreshError);
                    toast.error('Session expired. Please login again.');
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

    const fetchThreads = useCallback(async (page = 1) => {
        setIsLoading(true); setError(null);
        try {
            const params: ForumQueryParams = {
                PageNumber: page, PageSize: DEFAULT_PAGE_SIZE, SearchTerm: searchQuery || undefined,
                Category: categoryFilter === 'all' ? undefined : categoryFilter, MyThreads: showMyThreads || undefined,
            };
            const result = await callApiWithRetry<PagedResult<ForumThreadDto>>(() => forumApi.getThreads(params));
            if (result) {
                setThreads(result.items.map(t => ({ ...t, showComments: false }))); // Ensure showComments default
                setTotalPages(result.totalPages); setCurrentPage(result.pageNumber); setTotalThreads(result.totalCount);
            }
        } catch (err: any) {
            setError(`Failed to load threads: ${err.message}`); toast.error(`Threads Error: ${err.message}`);
            setThreads([]); setTotalPages(0); setTotalThreads(0);
        } finally { setIsLoading(false); }
    }, [searchQuery, categoryFilter, showMyThreads, callApiWithRetry]);

    useEffect(() => { fetchThreads(currentPage); }, [fetchThreads, currentPage]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchThreads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categoryFilter, showMyThreads]);

    const handleCreateThread = async (formDataFromModal: ThreadFormData) => {
        setIsActionLoading(true);
        try {
            const createDto: CreateForumThreadDto = {
                title: formDataFromModal.title, content: formDataFromModal.content, 
                category: formDataFromModal.category, imageUrl: formDataFromModal.imageUrl
            };
            const newThread = await callApiWithRetry<ForumThreadDto | null>(() => forumApi.createThread(createDto));
            if(newThread) {
                toast.success('Thread created!'); setIsCreateModalOpen(false);
                if (currentPage === 1 && !searchQuery && categoryFilter === 'all' && !showMyThreads) fetchThreads(1); 
                else { setSearchQuery(''); setCategoryFilter('all'); setShowMyThreads(false); setCurrentPage(1); } // Reset & refetch
            }
        } catch (err: any) { toast.error(`Create thread failed: ${err.message}`); } 
        finally { setIsActionLoading(false); }
    };
    
    const handleEditClick = async (thread: ForumThreadDto) => {
        // If your list view only shows summarized content, you might fetch the full thread here
        // For simplicity, assuming the 'content' in the list DTO is full or good enough for edit modal init
        setThreadToEdit(thread);
        setIsEditModalOpen(true);
    };

    const handleUpdateThread = async (formDataFromModal: ThreadFormData) => {
        if (!threadToEdit) return;
        setIsActionLoading(true);
        try {
            const updateDto: UpdateForumThreadDto = {
                title: formDataFromModal.title, content: formDataFromModal.content, 
                category: formDataFromModal.category, imageUrl: formDataFromModal.imageUrl
            };
            const updatedThread = await callApiWithRetry<ForumThreadDto | null>(() => forumApi.updateThread(threadToEdit.id, updateDto));
            if(updatedThread){
                toast.success('Thread updated!');
                setThreads(prev => prev.map(t => t.id === updatedThread.id ? { ...t, ...updatedThread, showComments: t.showComments } : t));
                setIsEditModalOpen(false); setThreadToEdit(null);
            }
        } catch (err: any) { toast.error(`Update thread failed: ${err.message}`); } 
        finally { setIsActionLoading(false); }
    };

    const handleDeleteClick = (thread: ForumThreadDto) => { setThreadToDelete(thread); setIsDeleteDialogOpen(true); };

    const handleDeleteConfirm = async () => {
        if (!threadToDelete) return;
        setIsActionLoading(true);
        try {
            await callApiWithRetry<void | null>(() => forumApi.deleteThread(threadToDelete.id));
            toast.success('Thread deleted!');
            if (threads.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
            else fetchThreads(currentPage); // Refetch
        } catch (err: any) { toast.error(`Delete thread failed: ${err.message}`); } 
        finally { setIsActionLoading(false); setIsDeleteDialogOpen(false); setThreadToDelete(null); }
    };

    const toggleShowComments = (threadId: number) => setThreads(prev => prev.map(t => t.id === threadId ? { ...t, showComments: !t.showComments } : t));
    const handlePreviousPage = () => (currentPage > 1) && setCurrentPage(p => p - 1);
    const handleNextPage = () => (currentPage < totalPages) && setCurrentPage(p => p + 1);
    const formatRelativeTime = (dateStringISO?: string): string => {
        if (!dateStringISO) return 'just now';
        try { return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true }); }
        catch { return dateStringISO; } // Fallback
    };
    
    const editModalInitialData: ThreadFormData | undefined = threadToEdit ? {
        title: threadToEdit.title, content: threadToEdit.content, category: threadToEdit.category,
        image: null, imagePreview: threadToEdit.imageUrl, imageUrl: threadToEdit.imageUrl,
        // Pass the relative path if your backend expects it for identifying old image for deletion
        currentRelativePath: threadToEdit.imageUrl ? threadToEdit.imageUrl.substring(threadToEdit.imageUrl.indexOf("/uploads/")) : undefined
    } : undefined;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C]">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-unbounded bg-gradient-to-r from-white via-white to-[#D68BF9] bg-clip-text text-transparent">Discussion Forum</h1>
                            <p className="text-[#D68BF9] text-lg font-nunito">Connect and learn with your peers</p>
                        </div>
                        <div className="flex flex-shrink-0 gap-2 md:gap-4 self-start md:self-center">
                            <MyThreadsButton onClick={() => setShowMyThreads(prev => !prev)} active={showMyThreads} />
                            <button onClick={() => setIsCreateModalOpen(true)} disabled={isLoading || isActionLoading} className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-[#BF4BF6] to-[#7A00B8] text-white rounded-xl hover:from-[#D68BF9] hover:to-[#BF4BF6] transition-all duration-300 flex items-center gap-2 font-nunito shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                <Plus className="h-5 w-5" /><span className="hidden sm:inline">Create Thread</span><span className="sm:hidden">New</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-[#BF4BF6]/20 shadow-md">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#52007C]" />
                                <input type="text" placeholder="Search threads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={isLoading || isActionLoading} className="w-full bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl pl-12 pr-4 py-3 text-[#1B0A3F] placeholder-[#52007C]/60 focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito" />
                            </div>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} disabled={isLoading || isActionLoading} className="bg-[#F6E6FF]/50 border border-[#BF4BF6]/20 rounded-xl px-4 py-3 text-[#1B0A3F] w-full md:w-auto md:min-w-[180px] focus:ring-2 focus:ring-[#BF4BF6] focus:border-transparent font-nunito">
                                <option value="all">All Categories</option>
                                {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                            </select>
                        </div>
                    </div>

                    {/* --- Loading / Error / Content Area --- */}
                    {isLoading && threads.length === 0 && (
                        <div className="flex justify-center items-center p-10 text-white"><RefreshCw className="h-8 w-8 animate-spin mr-3" /><span>Loading threads...</span></div>
                    )}
                    {error && !isLoading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                            <AlertCircle className="inline h-5 w-5 mr-2 align-text-bottom"/><strong className="font-bold mr-1">Error!</strong><span className="block sm:inline">{error}</span>
                            <button onClick={() => fetchThreads(1)} className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-nunito">Retry</button>
                        </div>
                    )}

                    {!error && (
                     <>
                        <div className="space-y-4 relative">
                            {(isLoading || isActionLoading) && threads.length > 0 && (
                                <div className="absolute inset-0 bg-gradient-to-b from-[#52007C]/10 to-[#34137C]/10 backdrop-blur-xs z-10 flex items-center justify-center rounded-lg"><RefreshCw className="h-6 w-6 animate-spin text-white/70" /></div>
                            )}
                            {!isLoading && threads.length === 0 && (
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-[#BF4BF6]/20 p-8 text-center mt-4">
                                    <MessageSquare className="h-12 w-12 text-[#BF4BF6] mx-auto mb-4" /><h3 className="text-xl font-medium text-[#1B0A3F] mb-2 font-unbounded">No threads found</h3>
                                    <p className="text-[#52007C]/80 font-nunito">{showMyThreads ? "You haven't created any threads yet." : "No threads match your current filters."}</p>
                                </div>
                            )}
                            
                            {threads.map(thread => (
                                <div key={thread.id} className={`bg-white/95 backdrop-blur-sm rounded-lg border border-[#BF4BF6]/20 shadow-sm overflow-hidden hover:border-[#BF4BF6]/40 transition-all duration-300 ${isActionLoading && (threadToEdit?.id === thread.id || threadToDelete?.id === thread.id) ? 'opacity-50' : ''}`}>
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar and Author Info */}
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#BF4BF6] to-[#7A00B8] flex items-center justify-center text-white font-bold text-sm shadow-md font-nunito" title={thread.author?.name ?? 'User'}>
                                                {thread.author?.avatar ? (<img src={thread.author.avatar} alt={thread.author.name ?? ''} className="w-full h-full rounded-lg object-cover" />) : (thread.author?.name?.charAt(0)?.toUpperCase() ?? 'U')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {/* Thread Title and Meta */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="text-base sm:text-lg font-medium text-[#1B0A3F] font-unbounded truncate hover:text-clip hover:whitespace-normal" title={thread.title}>{thread.title}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mt-0.5">
                                                            <span className="text-[#52007C] font-nunito text-xs sm:text-sm font-medium">{thread.author?.name ?? 'Anonymous'}</span>
                                                            <span className="text-[#52007C]/70 flex items-center gap-1 font-nunito text-xs whitespace-nowrap"><Clock className="h-3 w-3 flex-shrink-0" />{formatRelativeTime(thread.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    {/* Actions: Edit/Delete */}
                                                    {thread.isCurrentUserAuthor && (
                                                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                                            <button title="Edit Thread" disabled={isLoading || isActionLoading} className="p-1 sm:p-1.5 text-[#52007C] hover:bg-[#F0D9FF] rounded-md transition-colors disabled:opacity-50" onClick={() => handleEditClick(thread)}><Edit2 className="h-4 w-4" /></button>
                                                            <button title="Delete Thread" disabled={isLoading || isActionLoading} className="p-1 sm:p-1.5 text-[#52007C] hover:bg-red-100 hover:text-red-500 rounded-md transition-colors disabled:opacity-50" onClick={() => handleDeleteClick(thread)}><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Content Preview & Image */}
                                                <p className="text-[#52007C]/90 mt-1.5 font-nunito line-clamp-3 text-sm leading-relaxed">{thread.content}</p>
                                                {thread.imageUrl && (<img src={thread.imageUrl} alt="" /* Decorative */ className="mt-2 rounded-md max-h-40 sm:max-h-48 object-cover w-auto border border-purple-100" onError={(e) => (e.currentTarget.style.display = 'none')}/>)}
                                                {/* Footer: Category & Comments Toggle */}
                                                <div className="mt-3 flex items-center gap-3">
                                                    <span className="px-2.5 py-1 bg-[#F6E6FF] text-[#5E2A8A] text-[11px] sm:text-xs font-semibold rounded-full font-nunito border border-[#BF4BF6]/30 whitespace-nowrap">{thread.category}</span>
                                                    <button onClick={() => toggleShowComments(thread.id)} className="flex items-center gap-1 text-[#52007C] hover:text-[#BF4BF6] font-nunito text-xs transition-colors" aria-label={thread.showComments ? "Hide comments" : "Show comments"}>
                                                        <MessageCircle className="h-4 w-4" /><span>{thread.commentsCount}</span>
                                                    </button>
                                                </div>
                                                {/* Comment Section */}
                                                {thread.showComments && (<div className="border-t border-[#D0A0E6]/50 mt-3 pt-3"><CommentSection threadId={thread.id} currentUserId={user?.id ?? null} /></div>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <button onClick={handlePreviousPage} disabled={currentPage <= 1 || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors">
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                <span className="text-sm text-white/80 font-nunito order-first sm:order-none">Page {currentPage} of {totalPages} <span className='hidden sm:inline'> ({totalThreads} threads)</span></span>
                                <button onClick={handleNextPage} disabled={currentPage >= totalPages || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors">
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                     </>
                   )}
                </div> {/* End max-w-7xl */}

                {/* Modals */}
                <CreateThreadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateThread} />
                {editModalInitialData && threadToEdit && (<EditThreadModal isOpen={isEditModalOpen} onClose={() => {setIsEditModalOpen(false); setThreadToEdit(null);}} onSubmit={handleUpdateThread} initialData={editModalInitialData} />)}
                {threadToDelete && (<DeleteItemDialog isOpen={isDeleteDialogOpen} onClose={() => {setIsDeleteDialogOpen(false); setThreadToDelete(null);}} onConfirm={handleDeleteConfirm} itemName="thread" itemContentPreview={threadToDelete.title} />)}
            
            </div> {/* End gradient background */}
        </Layout>
    );
};

export default DiscussionForum;