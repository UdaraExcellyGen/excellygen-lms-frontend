// src/pages/DiscussionForum/DiscussionForum.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { 
    MessageSquare, Clock, MessageCircle, Edit2, Trash2,
    RefreshCw, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Layout from '../../../components/Sidebar/Layout';
import CreateThreadModal from './components/CreateThreadModal';
import EditThreadModal from './components/EditThreadModal';
import DeleteItemDialog from './components/DeleteItemDialog';
import MyThreadsButton from './components/MyThreadsButton';
import CommentSection from './components/CommentSection';
import * as forumApi from '../../../api/forumApi'; 
import { 
    ThreadFormData, ForumThreadDto, ForumQueryParams, 
    CreateForumThreadDto, UpdateForumThreadDto, CategorySelectOption 
} from './types/dto'; 
import { useAuth } from '../../../contexts/AuthContext'; 
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { getAllCategories as fetchAllCourseCategoriesFromAdminApi } from '../../../features/Admin/ManageCourseCategory/data/api'; 
import { Category as AdminCourseCategoryType } from '../../../features/Admin/ManageCourseCategory/types/category.types';
import { useBadgeChecker } from '../../../hooks/useBadgeChecker';
import ThreadCardSkeleton from './components/ThreadCardSkeleton';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';
import ForumActionBar from './components/ForumActionBar';

const DEFAULT_PAGE_SIZE = 10;

const getErrorMessage = (err: any, defaultMessage: string): string => {
    if (forumApi.isAxiosError(err)) {
        const backendMessage = err.response?.data as { message?: string };
        return backendMessage?.message || err.message || defaultMessage;
    } else if (err instanceof Error) {
        return err.message || defaultMessage;
    }
    return defaultMessage;
};

const DiscussionForum: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const [threads, setThreads] = useState<ForumThreadDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

    const [courseCategories, setCourseCategories] = useState<AdminCourseCategoryType[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<ForumThreadDto | null>(null);
    const [threadToEdit, setThreadToEdit] = useState<ForumThreadDto | null>(null);

    const [searchInput, setSearchInput] = useState(''); 
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const [selectedCategoryFilterOption, setSelectedCategoryFilterOption] = useState<SingleValue<CategorySelectOption>>({ value: 'all', label: 'All Categories' });
    const [showMyThreads, setShowMyThreads] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalThreads, setTotalThreads] = useState(0);

    const [commentPostTrigger, setCommentPostTrigger] = useState(0);
    useBadgeChecker(commentPostTrigger);

    useEffect(() => {
        const loadCategories = async () => { 
            setIsLoadingCategories(true); 
            setErrorCategories(null);
            try { 
                const categoriesData = await fetchAllCourseCategoriesFromAdminApi(); 
                setCourseCategories(categoriesData.filter(cat => cat.status === 'active')); 
            } catch (err: any) { 
                const msg = getErrorMessage(err, "Could not load categories");
                setErrorCategories(msg); 
                toast.error(`Categories Error: ${msg}`); 
            } finally { 
                setIsLoadingCategories(false); 
            }
        };
        loadCategories();
    }, []);

    useEffect(() => { 
        const timerId = setTimeout(() => { 
            setDebouncedSearchQuery(searchInput); 
        }, 500); 
        return () => clearTimeout(timerId);
    }, [searchInput]);

    const filterCategoryOptions: CategorySelectOption[] = [
        { value: 'all', label: 'All Categories' }, 
        ...courseCategories.map(cat => ({ value: cat.title, label: cat.title }))
    ];

    const handleCategoryFilterChange = (selectedOption: SingleValue<CategorySelectOption>) => { 
        setSelectedCategoryFilterOption(selectedOption); 
    };
    
    const fetchThreads = useCallback(async (page = 1) => { 
        setIsLoading(true); 
        setError(null);
        try {
            const params: ForumQueryParams = { 
                PageNumber: page, 
                PageSize: DEFAULT_PAGE_SIZE, 
                SearchTerm: debouncedSearchQuery || undefined, 
                Category: (selectedCategoryFilterOption && selectedCategoryFilterOption.value !== 'all') ? selectedCategoryFilterOption.value : undefined, 
                MyThreads: showMyThreads || undefined,
            };
            const result = await forumApi.getThreads(params); 
            const fetchedThreads = result.items.map((t: ForumThreadDto) => ({ ...t, showComments: t.showComments || false }));
            setThreads(fetchedThreads); 
            setTotalPages(result.totalPages); 
            setCurrentPage(result.pageNumber); 
            setTotalThreads(result.totalCount);

            if (!currentUserAvatar) {
                const userThread = fetchedThreads.find(t => t.isCurrentUserAuthor);
                if (userThread && userThread.author?.avatar) {
                    setCurrentUserAvatar(userThread.author.avatar);
                }
            }

        } catch (err: any) { 
            const errorMessageText = getErrorMessage(err, 'Could not load threads.');
            setError(errorMessageText); 
            toast.error(`Threads Error: ${errorMessageText}`); 
            setThreads([]); 
            setTotalPages(0); 
            setTotalThreads(0); 
        } finally { 
            setIsLoading(false); 
        }
    }, [debouncedSearchQuery, selectedCategoryFilterOption?.value, showMyThreads, currentUserAvatar]); 

    useEffect(() => { 
        fetchThreads(currentPage); 
    }, [fetchThreads, currentPage]);

    useEffect(() => { 
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchThreads(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearchQuery, selectedCategoryFilterOption?.value, showMyThreads]);

    const handleCommentPosted = () => {
        setCommentPostTrigger(count => count + 1);
    };

    const handleCreateThread = async (formDataFromModal: ThreadFormData) => { 
        setIsActionLoading(true);
        try {
            const createDto: CreateForumThreadDto = {
                title: formDataFromModal.title, 
                content: formDataFromModal.content, 
                category: formDataFromModal.category, 
                imageUrl: formDataFromModal.imageUrl
            };
            await forumApi.createThread(createDto); 
            toast.success('Thread created successfully!'); 
            setIsCreateModalOpen(false);
            setSearchInput(''); 
            setSelectedCategoryFilterOption({ value: 'all', label: 'All Categories' }); 
            setShowMyThreads(false); 
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchThreads(1);
            }
        } catch (err: any) { 
            toast.error(`Create thread failed: ${getErrorMessage(err, 'An unknown error occurred during creation.')}`); 
        } finally { 
            setIsActionLoading(false); 
        }
    };
    
    const handleEditClick = (thread: ForumThreadDto) => { 
        setThreadToEdit(thread); 
        setIsEditModalOpen(true);
    };

    const handleUpdateThread = async (formDataFromModal: ThreadFormData) => { 
        if (!threadToEdit) return; 
        setIsActionLoading(true);
        try {
            const updateDto: UpdateForumThreadDto = {
                title: formDataFromModal.title, 
                content: formDataFromModal.content, 
                category: formDataFromModal.category,
                imageUrl: formDataFromModal.imageUrl,
                removeCurrentImage: !formDataFromModal.imageUrl && !!threadToEdit.imageUrl
            };
            const updatedThread = await forumApi.updateThread(threadToEdit.id, updateDto);
            toast.success('Thread updated successfully!');
            setThreads(prev => prev.map(t => 
                t.id === updatedThread.id 
                    ? { ...t, ...updatedThread, showComments: t.showComments } 
                    : t
            ));
            setIsEditModalOpen(false); 
            setThreadToEdit(null);
        } catch (err: any) { 
            toast.error(`Update thread failed: ${getErrorMessage(err, 'An unknown error occurred during update.')}`); 
        } finally { 
            setIsActionLoading(false); 
        }
    };

    const handleDeleteClick = (thread: ForumThreadDto) => { 
        setThreadToDelete(thread); 
        setIsDeleteDialogOpen(true); 
    };

    const handleDeleteConfirm = async () => { 
        if (!threadToDelete) return; 
        setIsActionLoading(true);
        try { 
            await forumApi.deleteThread(threadToDelete.id); 
            toast.success('Thread deleted successfully!');
            const newTotalThreads = totalThreads - 1;
            const newTotalPages = Math.max(1, Math.ceil(newTotalThreads / DEFAULT_PAGE_SIZE));
            let pageToFetch = currentPage > newTotalPages ? newTotalPages : currentPage;
            pageToFetch = threads.length === 1 && pageToFetch > 1 ? pageToFetch - 1 : pageToFetch;
            
            if (pageToFetch !== currentPage) {
                setCurrentPage(pageToFetch);
            } else {
                fetchThreads(pageToFetch);
            }
        } catch (err: any) { 
            toast.error(`Delete thread failed: ${getErrorMessage(err, 'An unknown error occurred during deletion.')}`); 
        } finally { 
            setIsActionLoading(false); 
            setIsDeleteDialogOpen(false); 
            setThreadToDelete(null); 
        }
    };
    
    const toggleShowComments = (threadId: number) => { 
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, showComments: !t.showComments } : t));
    };

    const handlePreviousPage = () => { if (currentPage > 1) { setCurrentPage(p => p - 1); } };
    const handleNextPage = () => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); } };
    const formatRelativeTime = (dateStringISO?: string): string => { 
        if (!dateStringISO) return 'just now'; 
        try { return formatDistanceToNow(parseISO(dateStringISO), { addSuffix: true }); } 
        catch { return dateStringISO; } 
    };
    
    const editModalInitialData: ThreadFormData | undefined = threadToEdit ? {
        title: threadToEdit.title, content: threadToEdit.content, category: threadToEdit.category,
        image: null, imagePreview: threadToEdit.imageUrl ?? undefined, imageUrl: threadToEdit.imageUrl ?? undefined, 
        currentRelativePath: threadToEdit.imageUrl && threadToEdit.imageUrl.includes("/uploads/") ? threadToEdit.imageUrl.substring(threadToEdit.imageUrl.indexOf("/uploads/")) : undefined
    } : undefined;

    const userForActionBar = user ? {
        ...user,
        avatar: user.avatar || currentUserAvatar,
    } : null;

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] py-6">
                <div className="w-full px-6 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
                    {/* Grouped header, button, and action bar to control spacing */}
                    <div>
                        <div className="text-center mb-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Discussion Forum
                            </h1>
                            <p className="text-base text-[#D68BF9] mt-2">
                                Connect and learn with your peers
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-end mb-4">
                                <MyThreadsButton 
                                    onClick={() => setShowMyThreads(prev => !prev)} 
                                    active={showMyThreads} 
                                />
                            </div>
                            <ForumActionBar
                                user={userForActionBar}
                                onTriggerCreate={() => setIsCreateModalOpen(true)}
                                searchTerm={searchInput}
                                onSearchChange={setSearchInput}
                                categoryOptions={filterCategoryOptions}
                                selectedCategory={selectedCategoryFilterOption}
                                onCategoryChange={handleCategoryFilterChange}
                                isLoadingCategories={isLoadingCategories}
                            />
                        </div>
                    </div>
                    
                    {isLoading && (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <ThreadCardSkeleton key={index} />
                            ))}
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center" role="alert">
                            <AlertCircle className="inline h-5 w-5 mr-2 align-text-bottom"/>
                            <strong className="font-bold mr-1">Error!</strong>
                            <span className="block sm:inline">{error}</span>
                            <button onClick={() => fetchThreads(1)} className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-nunito">Retry</button>
                        </div>
                    )}

                    {!isLoading && !error && threads.length === 0 && (
                         <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-300/30 p-8 text-center mt-4">
                            <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-purple-800 mb-2 font-unbounded">No threads found</h3>
                            <p className="text-purple-700/80 font-nunito">{showMyThreads ? "You haven't created any threads." : "No threads match filters."}</p>
                        </div>
                    )}

                    {!isLoading && threads.length > 0 && (
                        <>
                            <div className="space-y-4 relative"> 
                                {(isActionLoading) && (
                                    <div className="absolute inset-0 bg-purple-700/10 backdrop-blur-xs z-10 flex items-center justify-center rounded-lg">
                                        <RefreshCw className="h-6 w-6 animate-spin text-white/80" />
                                    </div>
                                )}
                                
                                {threads.map(thread => (
                                    <div 
                                        key={thread.id}
                                        onClick={() => navigate(`/learner/forum/threads/${thread.id}`)}
                                        className={`bg-white/90 backdrop-blur-sm rounded-xl border border-purple-300/40 shadow-md overflow-hidden hover:shadow-purple-300/40 transition-all duration-300 cursor-pointer ${isActionLoading && (threadToEdit?.id === thread.id || threadToDelete?.id === thread.id) ? 'opacity-60 pointer-events-none' : ''}`}
                                    >
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-bold text-purple-900 hover:underline" title={thread.title}>
                                                                {thread.title}
                                                            </h3>
                                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                                <div className="flex-shrink-0 w-5 h-5 rounded-full mr-2">
                                                                    {thread.author?.avatar ? (<img src={thread.author.avatar} alt={thread.author.name ?? ''} className="w-full h-full rounded-full object-cover" />) : (
                                                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs shadow">
                                                                            {thread.author?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (thread.author?.id) {
                                                                            navigate(`/learner/profile/${thread.author.id}`);
                                                                        }
                                                                    }}
                                                                    disabled={!thread.author?.id}
                                                                    className="font-medium text-purple-700 hover:underline disabled:no-underline disabled:cursor-default"
                                                                    title={thread.author?.id ? `View profile of ${thread.author.name}` : undefined}
                                                                >
                                                                    {thread.author?.name ?? 'Anonymous'}
                                                                </button>
                                                                <Clock className="h-3 w-3 mx-1.5 text-gray-400" />
                                                                <span>{formatRelativeTime(thread.createdAt)}</span>
                                                                {thread.updatedAt && new Date(parseISO(thread.updatedAt)).getTime() > new Date(parseISO(thread.createdAt)).getTime() + (60 * 1000) && (
                                                                    <span className="ml-2 italic text-gray-400 text-[10px] sm:text-xs">
                                                                        (edited)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {thread.isCurrentUserAuthor && (
                                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                                                <button title="Edit Thread" disabled={isActionLoading} className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100/50 rounded-md" onClick={(e) => { e.stopPropagation(); handleEditClick(thread); }}><Edit2 size={16} /></button>
                                                                <button title="Delete Thread" disabled={isActionLoading} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100/50 rounded-md" onClick={(e) => { e.stopPropagation(); handleDeleteClick(thread); }}><Trash2 size={16} /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <MarkdownRenderer
                                                        content={thread.content.substring(0, 250) + (thread.content.length > 250 ? '...' : '')}
                                                        className="prose prose-sm max-w-none text-gray-700 mt-2 line-clamp-3"
                                                    />
                                                    {thread.imageUrl && (
                                                        <div className="mt-3 max-w-xs">
                                                            <img src={thread.imageUrl} alt="Thread attachment" className="rounded-md max-h-48 object-contain border bg-gray-100" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                        </div>
                                                    )}
                                                    <div className="mt-3 pt-3 flex items-center justify-between border-t border-purple-200/30">
                                                        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{thread.category}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); toggleShowComments(thread.id); }} className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium" aria-label={thread.showComments ? "Hide comments" : "Show comments"}>
                                                            <MessageCircle size={16} className={thread.showComments ? 'text-purple-700 fill-purple-100' : ''} />
                                                            <span>{thread.commentsCount} Comment{thread.commentsCount !== 1 ? 's' : ''}</span>
                                                        </button>
                                                    </div>
                                                    {thread.showComments && (
                                                        <div className="mt-3 pt-3 border-t border-purple-200/30">
                                                            <CommentSection threadId={thread.id} currentUserId={user?.id ?? null} onCommentPosted={handleCommentPosted} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button onClick={handlePreviousPage} disabled={currentPage <= 1 || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors"><ChevronLeft className="h-4 w-4" /> Previous</button>
                                    <span className="text-sm text-white/80 font-nunito order-first sm:order-none">Page {currentPage} of {totalPages} <span className='hidden sm:inline'> ({totalThreads} threads)</span></span>
                                    <button onClick={handleNextPage} disabled={currentPage >= totalPages || isLoading || isActionLoading} className="w-full sm:w-auto px-4 py-2 bg-white/90 text-[#52007C] rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-1 font-nunito transition-colors">Next <ChevronRight className="h-4 w-4" /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <CreateThreadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateThread} availableCategories={courseCategories.map(cat => cat.title)} />
                {editModalInitialData && threadToEdit && (<EditThreadModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setThreadToEdit(null); }} onSubmit={handleUpdateThread} initialData={editModalInitialData} availableCategories={courseCategories.map(cat => cat.title)} />)}
                {threadToDelete && (<DeleteItemDialog isOpen={isDeleteDialogOpen} onClose={() => { setIsDeleteDialogOpen(false); setThreadToDelete(null);}} onConfirm={handleDeleteConfirm} itemName="thread" itemContentPreview={threadToDelete.title} />)}
            </div>
        </Layout>
    );
};

export default DiscussionForum;